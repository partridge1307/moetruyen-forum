import { db } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    const query = url.searchParams.get('q');
    if (!query) return new Response('Invalid', { status: 422 });

    const users = await db.user.findMany({
      where: {
        OR: query
          .split(' ')
          .map((q) => ({ name: { contains: q, mode: 'insensitive' } })),
      },
      select: {
        id: true,
        name: true,
      },
      take: 5,
    });

    return new Response(JSON.stringify(users));
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
