const discordRegex =
  /(https:\/\/)?(www)?discord.?(gg|com)?\/(invite)?\/([^\/\?\&\%]*)\S/;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const href = url.searchParams.get(`url`);
  if (!href) return new Response('Invalid href', { status: 400 });

  try {
    const data = await (
      await fetch(href, {
        method: 'GET',
        headers: { Accept: 'text/html; charset=utf-8' },
      })
    ).text();

    let title, titleMatch;
    if (href.match(discordRegex)) {
      titleMatch = data.match(/<meta property="og:title" content="(.*?)"/);
      title = titleMatch ? titleMatch[1] : null;
    } else {
      titleMatch = data.match(/<title>(.*?)<\/title>/);
      title = titleMatch ? titleMatch[1] : null;
    }

    const descriptionMatch = data.match(
      /<meta name="description" content="(.*?)"/
    );
    const description = descriptionMatch ? descriptionMatch[1] : null;

    const imageMatch = data.match(/<meta property="og:image" content="(.*?)"/);
    const imageUrl = imageMatch ? imageMatch[1] : null;

    return new Response(
      JSON.stringify({
        success: 1,
        link: href,
        meta: {
          title,
          description,
          image: {
            url: imageUrl,
          },
        },
      })
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: 0 }));
  }
}
