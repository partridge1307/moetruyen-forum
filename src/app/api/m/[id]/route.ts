import { getAuthSession } from '@/lib/auth';
import { DeleteSubForumImage, UploadForumImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import {
  CreatePostValidator,
  EditThreadFormValidator,
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

    const { title, content, description } = CreatePostValidator.parse(
      await req.json()
    );

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
          authorId: session.user.id,
          title,
          content: { ...content },
          description: !!description
            ? description.slice(0, 1024)
            : 'Không có mô tả',
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

    const { title, content, description } = CreatePostValidator.parse(
      await req.json()
    );

    await db.post.update({
      where: {
        id: +context.params.id,
        authorId: session.user.id,
      },
      data: {
        title,
        content: { ...content },
        description: !!description
          ? description.slice(0, 1024)
          : 'Không có mô tả',
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

    const { thumbnail, title, slug, canSend, managers } =
      EditThreadFormValidator.parse(await req.formData());

    const targetSubForum = await db.subForum.findUniqueOrThrow({
      where: {
        id: +context.params.id,
        creatorId: session.user.id,
      },
      select: {
        id: true,
        slug: true,
        banner: true,
        subscriptions: {
          where: {
            isManager: true,
          },
          select: {
            userId: true,
          },
        },
      },
    });

    if (
      slug &&
      (await db.subForum.findUnique({
        where: {
          slug,
          NOT: {
            id: targetSubForum.id,
          },
        },
      }))
    )
      return new Response('Existed slug', { status: 400 });

    if (
      managers.length &&
      !(
        await db.subscription.findMany({
          where: {
            subForumId: targetSubForum.id,
            userId: { in: managers.map((manager) => manager.id) },
            user: {
              verified: true,
            },
          },
        })
      ).length
    )
      return new Response('Invalid managers', { status: 406 });

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

    const subForumSlug = slug?.trim() ?? targetSubForum.slug;
    const removedManager = targetSubForum.subscriptions.filter(
      (user) => !managers.some((usr) => usr.id === user.userId)
    );

    if (managers.length) {
      await db.$transaction([
        db.subForum.update({
          where: {
            id: targetSubForum.id,
          },
          data: {
            title,
            slug: subForumSlug,
            canSend: canSend === 'true' ? true : false,
            banner: uploadedImage,
          },
        }),
        db.subscription.updateMany({
          where: {
            userId: { in: managers.map((manager) => manager.id) },
          },
          data: {
            isManager: true,
          },
        }),
      ]);
    } else
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

    !!removedManager.length &&
      (await db.subscription.updateMany({
        where: {
          userId: { in: removedManager.map((user) => user.userId) },
        },
        data: {
          isManager: false,
        },
      }));

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

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    await db.$transaction([
      db.post.findUniqueOrThrow({
        where: {
          id: +context.params.id,
          OR: [
            {
              authorId: session.user.id,
            },
            {
              subForum: {
                subscriptions: {
                  some: {
                    userId: session.user.id,
                    isManager: true,
                  },
                },
              },
            },
          ],
        },
      }),
      db.post.delete({
        where: {
          id: +context.params.id,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
