import { SearchPost } from '@/lib/query';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  const forumId = url.searchParams.get('id');
  if (!query || !forumId) return new Response('Invalid', { status: 422 });

  try {
    const posts = await SearchPost({
      searchPhrase: query,
      forumId: parseInt(forumId),
      take: 10,
    });

    return new Response(JSON.stringify(posts));
  } catch (error) {
    console.log(error);
    return new Response('Something went wrong', { status: 500 });
  }
}
