import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    await db.$transaction([
      db.notify.findUniqueOrThrow({
        where: {
          id: +context.params.id,
          isRead: false,
          toUserId: session.user.id,
        },
        select: {
          id: true,
        },
      }),
      db.notify.update({
        where: {
          id: +context.params.id,
        },
        data: {
          isRead: true,
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
