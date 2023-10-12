import { searchForum, searchManga, searchUser } from '@/lib/query';

export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    const query = url.searchParams.get('q');
    if (!query) return new Response('Invalid URL', { status: 422 });

    const [mangas, users, forums] = await Promise.all([
      searchManga({ searchPhrase: query, take: 10 }),
      searchUser({ searchPhrase: query, take: 10 }),
      searchForum({ searchPhrase: query, take: 10 }),
    ]);

    return new Response(JSON.stringify({ mangas, users, forums }));
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
