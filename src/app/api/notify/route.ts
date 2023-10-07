import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const NotifyValidator = z.object({
  limit: z.string(),
  cursor: z.string().nullish().optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { limit, cursor: userCursor } = NotifyValidator.parse({
      limit: url.searchParams.get('limit'),
      cursor: url.searchParams.get('cursor'),
    });

    const cursor = userCursor ? parseInt(userCursor) : undefined;

    let notify;
    if (cursor) {
      notify = await db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
        },
        select: {
          notifications: {
            take: parseInt(limit),
            skip: 1,
            cursor: {
              id: cursor,
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              type: true,
              content: true,
              endPoint: true,
              createdAt: true,
              isRead: true,
            },
          },
        },
      });
    } else {
      notify = await db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
        },
        select: {
          notifications: {
            take: parseInt(limit),
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              type: true,
              content: true,
              endPoint: true,
              createdAt: true,
              isRead: true,
            },
          },
        },
      });
    }

    return new Response(
      JSON.stringify({
        notifications: notify.notifications,
        lastCursor:
          notify.notifications.length === parseInt(limit)
            ? notify.notifications[notify.notifications.length - 1].id
            : undefined,
      })
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = z
      .object({
        id: z.number(),
      })
      .parse(await req.json());

    await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
          notifications: {
            some: {
              id,
              isRead: false,
            },
          },
        },
        select: {
          id: true,
        },
      }),
      db.notify.update({
        where: {
          id,
        },
        data: {
          isRead: true,
        },
      }),
    ]);

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

export async function DELETE() {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    await db.notify.deleteMany({
      where: {
        toUserId: session.user.id,
      },
    });

    return new Response('OK');
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function PUT() {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    await db.notify.updateMany({
      where: {
        toUserId: session.user.id,
      },
      data: {
        isRead: true,
      },
    });

    return new Response('OK');
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
