import { searchForum } from '@/lib/query';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  if (!query) return new Response('Invalid', { status: 422 });

  try {
    const result = await searchForum({ searchPhrase: query, take: 10 });

    return new Response(JSON.stringify(result));
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
