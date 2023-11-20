import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreatePostValidator } from '@/lib/validators/forum';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { title, content, plainTextContent } = CreatePostValidator.parse(
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
          // @ts-ignore
          content,
          plainTextContent: !!plainTextContent?.length
            ? plainTextContent
            : `Bài viết ${title}. Tác giả ${session.user.name}`,
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

    const { title, content, plainTextContent } = CreatePostValidator.parse(
      await req.json()
    );

    await db.post.update({
      where: {
        id: +context.params.id,
        authorId: session.user.id,
      },
      data: {
        title,
        // @ts-ignore
        content,
        plainTextContent: !!plainTextContent?.length
          ? plainTextContent
          : `Bài viết ${title}. Tác giả ${session.user.name}`,
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
