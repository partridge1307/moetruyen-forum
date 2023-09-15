import { getAuthSession } from '@/lib/auth';
import { DeleteSubForumImage, UploadForumImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import {
  CreatePostValidator,
  CreateThreadFormValidator,
} from '@/lib/validators/forum';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';

const PostValidator = z.object({
  limit: z.string(),
  cursor: z.string().nullish().optional(),
  sortBy: z.enum(['asc', 'desc', 'hot']),
});

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const url = new URL(req.url);

    const {
      limit,
      cursor: userCursor,
      sortBy,
    } = PostValidator.parse({
      limit: url.searchParams.get('limit'),
      cursor: url.searchParams.get('cursor'),
      sortBy: url.searchParams.get('sortBy'),
    });

    const orderBy: Prisma.PostOrderByWithRelationInput =
      sortBy === 'hot' ? { votes: { _count: 'desc' } } : { createdAt: sortBy };

    const cursor = userCursor ? parseInt(userCursor) : undefined;

    let posts;
    if (cursor) {
      posts = await db.post.findMany({
        where: {
          subForumId: +context.params.id,
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          votes: true,
          subForum: {
            select: {
              title: true,
              slug: true,
            },
          },
          author: {
            select: {
              name: true,
              color: true,
              image: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy,
        take: parseInt(limit),
        skip: 1,
        cursor: {
          id: cursor,
        },
      });
    } else {
      posts = await db.post.findMany({
        where: {
          subForumId: +context.params.id,
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          votes: true,
          subForum: {
            select: {
              title: true,
              slug: true,
            },
          },
          author: {
            select: {
              name: true,
              color: true,
              image: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy,
        take: parseInt(limit),
      });
    }

    return new Response(
      JSON.stringify({
        posts,
        lastCursor:
          posts.length === parseInt(limit)
            ? posts[posts.length - 1].id
            : undefined,
      })
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { title, content } = CreatePostValidator.parse(await req.json());

    await db.$transaction([
      db.subForum.findUniqueOrThrow({
        where: {
          id: +context.params.id,
          OR: [
            {
              canSend: true,
              subscriptions: {
                some: {
                  userId: session.user.id,
                },
              },
            },
            {
              creatorId: session.user.id,
            },
          ],
        },
        select: {
          id: true,
        },
      }),
      db.post.create({
        data: {
          subForumId: +context.params.id,
          title,
          content: { ...content },
          authorId: session.user.id,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { title, content } = CreatePostValidator.parse(await req.json());

    await db.post.update({
      where: {
        id: +context.params.id,
        authorId: session.user.id,
      },
      data: {
        title,
        content: { ...content },
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { thumbnail, title, slug, canSend } = CreateThreadFormValidator.parse(
      await req.formData()
    );

    const targetSubForum = await db.subForum.findUniqueOrThrow({
      where: {
        id: +context.params.id,
        creatorId: session.user.id,
      },
      select: {
        id: true,
        slug: true,
        banner: true,
      },
    });

    let uploadedImage: string | null = null;

    if (thumbnail) {
      if (thumbnail instanceof File) {
        uploadedImage = await UploadForumImage(
          thumbnail,
          targetSubForum.id,
          targetSubForum.banner
        );
      } else uploadedImage = thumbnail;
    } else if (targetSubForum.banner) {
      await DeleteSubForumImage(targetSubForum.id);
    }

    if (slug && (await db.subForum.findUnique({ where: { slug } })))
      return new Response('Existed slug', { status: 400 });

    const subForumSlug = slug?.trim() ?? targetSubForum.slug;

    await db.subForum.update({
      where: {
        id: targetSubForum.id,
      },
      data: {
        title,
        slug: subForumSlug,
        canSend: canSend === 'true' ? true : false,
        banner: uploadedImage,
      },
    });

    return new Response(JSON.stringify(subForumSlug));
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
