import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: Request, context: { params: { id: string } }) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  if (!query) return new Response('Invalid', { status: 422 });

  try {
    const forum = await db.subForum.findUniqueOrThrow({
      where: {
        id: +context.params.id,
      },
      select: {
        subscriptions: {
          take: 5,
          select: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return new Response(
      JSON.stringify(forum.subscriptions.map(({ user }) => user))
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
