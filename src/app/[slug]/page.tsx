import PostFeed from '@/components/Feed/PostFeed';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

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

  return (
    <>
      {!!(
        (subForum.canSend && subscription) ||
        subForum.creatorId === session?.user.id
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
