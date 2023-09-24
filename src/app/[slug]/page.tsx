import PostFeed from '@/components/Feed/PostFeed';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const subForum = await db.subForum.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      title: true,
      banner: true,
    },
  });

  if (!subForum)
    return {
      title: 'Moetruyen Forum',
      description: 'Moetruyen Forum',
    };

  return {
    title: {
      default: subForum.title,
      absolute: subForum.title,
    },
    description: `Cộng đồng ${subForum.title} | Moetruyen`,
    keywords: ['Forum', 'Diễn đàn', `${subForum.title}`, 'Moetruyen'],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/${params.slug}`,
    },
    openGraph: {
      ...(subForum.banner && {
        images: [{ url: subForum.banner, alt: `${subForum.title} Banner` }],
      }),
      url: `${process.env.NEXTAUTH_URL}/${params.slug}`,
      siteName: 'Moetruyen Forum',
      title: subForum.title,
      description: `Cộng đồng ${subForum.title} | Moetruyen`,
    },
    twitter: {
      ...(subForum.banner && {
        images: [{ url: subForum.banner, alt: `${subForum.title} Banner` }],
        card: 'summary_large_image',
      }),
      site: 'Moetruyen Forum',
      title: subForum.title,
      description: `Cộng đồng ${subForum.title} | Moetruyen`,
    },
  };
}

const MiniCreatePost = dynamic(() => import('@/components/MiniCreatePost'), {
  ssr: false,
  loading: () => (
    <div className="h-32 rounded-md animate-pulse dark:bg-zinc-900" />
  ),
});

const page = async ({ params }: { params: { slug: string } }) => {
  const [session, subForum] = await Promise.all([
    getAuthSession(),
    db.subForum.findUnique({
      where: {
        slug: params.slug,
      },
      select: {
        id: true,
        canSend: true,
        creatorId: true,
      },
    }),
  ]);
  if (!subForum) return notFound();

  const [posts, subscription] = await db.$transaction([
    db.post.findMany({
      where: {
        subForumId: subForum.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        votes: true,
        subForum: {
          select: {
            title: true,
            slug: true,
          },
        },
        author: {
          select: {
            name: true,
            color: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        votes: {
          _count: 'desc',
        },
      },
      take: INFINITE_SCROLL_PAGINATION_RESULTS,
    }),
    db.subscription.findFirst({
      where: {
        userId: session?.user.id,
        subForumId: subForum.id,
      },
    }),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((post, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${process.env.NEXTAUTH_URL}/${post.subForum.slug}/${post.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {!!(
        (subForum.canSend && subscription) ||
        subForum.creatorId === session?.user.id ||
        subscription?.isManager
      ) && <MiniCreatePost session={session} />}

      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Bài viết</h1>
        <PostFeed
          subForumId={subForum.id}
          initialPosts={{
            posts,
            lastCursor:
              posts.length === INFINITE_SCROLL_PAGINATION_RESULTS
                ? posts[posts.length - 1].id
                : undefined,
          }}
          session={session}
        />
      </div>
    </>
  );
};

export default page;
