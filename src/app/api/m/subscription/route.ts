import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreateSubscriptionValidator } from '@/lib/validators/forum';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { type, subForumId } = CreateSubscriptionValidator.parse(
      await req.json()
    );

    const [, subscription] = await db.$transaction([
      db.subForum.findUniqueOrThrow({
        where: {
          id: subForumId,
          NOT: {
            creatorId: session.user.id,
          },
        },
      }),
      db.subscription.findUnique({
        where: {
          userId_subForumId: {
            userId: session.user.id,
            subForumId: subForumId,
          },
        },
      }),
    ]);

    if (!subscription) {
      if (type === 'SUBSCRIBE') {
        await db.subscription.create({
          data: {
            userId: session.user.id,
            subForumId,
          },
        });

        return new Response('OK');
      } else {
        return new Response('Not found', { status: 404 });
      }
    } else {
      if (type === 'SUBSCRIBE')
        return new Response('Already subscribed', { status: 406 });
      else {
        await db.subscription.delete({
          where: {
            userId_subForumId: {
              userId: session.user.id,
              subForumId,
            },
          },
        });

        return new Response('OK');
      }
    }
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
