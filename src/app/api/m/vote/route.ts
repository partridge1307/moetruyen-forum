import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { VoteValidator } from '@/lib/validators/vote';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id, voteType } = VoteValidator.parse(await req.json());

    const existingVote = await db.postVote.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: id,
        },
      },
      select: {
        type: true,
      },
    });

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.postVote.delete({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId: id,
            },
          },
        });

        return new Response('OK');
      }

      await db.postVote.update({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: id,
          },
        },
        data: {
          type: voteType,
        },
      });

      return new Response('OK');
    } else {
      await db.postVote.create({
        data: {
          type: voteType,
          userId: session.user.id,
          postId: id,
        },
      });

      return new Response('OK');
    }
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
