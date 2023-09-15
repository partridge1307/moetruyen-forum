import { db } from '@/lib/db';

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const subComments = await db.postComment.findMany({
      where: {
        replyToId: +context.params.id,
      },
      select: {
        id: true,
        content: true,
        oEmbed: true,
        createdAt: true,
        votes: true,
        creatorId: true,
        creator: {
          select: {
            name: true,
            color: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return new Response(JSON.stringify(subComments));
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
