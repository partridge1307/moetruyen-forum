import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Homepage = dynamic(() => import('@/components/Sidebar/Homepage'));
const Feed = dynamic(() => import('@/components/Feed'), { ssr: false });

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const tab = searchParams['tab'] ?? 'home';
  const posts = await getPosts(tab === 'following');

  return (
    <>
      <section className="relative w-full lg:w-4/6 max-sm:pb-16 bg-primary-foreground">
        <div className="sticky top-0 z-50 flex mb-5 border-b-2 border-primary bg-primary-foreground">
          <Link href="/" className="w-full p-5 pb-4 text-center">
            <span
              className={
                tab !== 'following'
                  ? 'pb-1 border-b-4 border-primary'
                  : undefined
              }
            >
              Mọi người
            </span>
          </Link>
          <Link href="/?tab=following" className="w-full p-5 pb-4 text-center">
            <span
              className={
                tab === 'following'
                  ? 'pb-1 border-b-4 border-primary'
                  : undefined
              }
            >
              Theo dõi
            </span>
          </Link>
        </div>

        <div className="p-3">
          {!posts?.length ? (
            <p className="text-3xl font-semibold">Không có kết quả</p>
          ) : (
            <Feed
              initialPosts={{
                posts,
                lastCursor:
                  posts.length === INFINITE_SCROLL_PAGINATION_RESULTS
                    ? posts[posts.length - 1].id
                    : undefined,
              }}
              type={tab === 'following' ? 'FOLLOW' : 'GENERAL'}
            />
          )}
        </div>
      </section>
      <Homepage />
    </>
  );
};

export default page;

const getPosts = async (isFollowTab: boolean) => {
  if (!isFollowTab)
    return db.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: INFINITE_SCROLL_PAGINATION_RESULTS,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        votes: true,
        subForum: {
          select: {
            slug: true,
            title: true,
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
    });
  else {
    const session = await getAuthSession();
    if (!session) return null;

    return db.post.findMany({
      where: {
        subForum: {
          OR: [
            {
              creatorId: session.user.id,
            },
            {
              subscriptions: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          ],
        },
      },
      take: INFINITE_SCROLL_PAGINATION_RESULTS,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        votes: true,
        subForum: {
          select: {
            slug: true,
            title: true,
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
    });
  }
};
