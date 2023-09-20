import { getAuthSession } from '@/lib/auth';
import { DeleteSubForumImage, UploadForumImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { normalizeText } from '@/lib/utils';
import { CreateThreadFormValidator } from '@/lib/validators/forum';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';

const PostValidator = z.object({
  limit: z.string(),
  cursor: z.string().nullish().optional(),
  sortBy: z.enum(['asc', 'desc', 'hot']),
});

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();
  let followedSubForumIds: number[] = [];

  if (session) {
    const subForums = await db.subForum.findMany({
      where: {
        OR: [
          {
            subscriptions: {
              some: { userId: session.user.id },
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
    });

    followedSubForumIds = subForums.map((sub) => sub.id);
  }

  try {
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
    const whereClause: Prisma.PostWhereInput = session
      ? { subForum: { id: { in: followedSubForumIds } } }
      : {};

    const cursor = userCursor ? parseInt(userCursor) : undefined;

    let posts;
    if (cursor) {
      posts = await db.post.findMany({
        where: whereClause,
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
        where: whereClause,
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

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { slug, thumbnail, title, canSend } = CreateThreadFormValidator.parse(
      await req.formData()
    );

    if (
      slug &&
      (await db.subForum.findUnique({
        where: { slug },
      }))
    ) {
      return new Response('Existing slug', { status: 400 });
    }

    const [, createdSubForum] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
          verified: true,
        },
      }),
      db.subForum.create({
        data: {
          slug: title,
          title,
          creatorId: session.user.id,
          canSend: canSend === 'true' ? true : false,
        },
      }),
    ]);

    const subForumSlug =
      slug?.trim() ??
      `${normalizeText(createdSubForum.title)
        .toLowerCase()
        .split(' ')
        .join('-')}-${createdSubForum.id}`;

    if (thumbnail) {
      const image =
        thumbnail instanceof File
          ? await UploadForumImage(thumbnail, createdSubForum.id, null)
          : thumbnail;

      await db.subForum.update({
        where: {
          id: createdSubForum.id,
        },
        data: {
          banner: image,
          slug: subForumSlug,
        },
      });
    } else {
      await db.subForum.update({
        where: {
          id: createdSubForum.id,
        },
        data: {
          slug: subForumSlug,
        },
      });
    }

    return new Response(JSON.stringify(subForumSlug));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        return new Response('Existed sub forum', { status: 406 });
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { subForumId } = z
      .object({ subForumId: z.number() })
      .parse(await req.json());

    await db.$transaction([
      db.subForum.findUniqueOrThrow({
        where: {
          id: subForumId,
          creatorId: session.user.id,
        },
      }),
      db.subForum.delete({
        where: {
          id: subForumId,
        },
      }),
    ]);
    await DeleteSubForumImage(subForumId);

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
