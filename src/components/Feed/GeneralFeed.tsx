import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import PostFeed from './PostFeed';

const GeneralFeed = async () => {
  const posts = await db.post.findMany({
    orderBy: {
      votes: {
        _count: 'desc',
      },
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
    take: INFINITE_SCROLL_PAGINATION_RESULTS,
  });

  return (
    <PostFeed
      initialPosts={{
        posts,
        lastCursor:
          posts.length === INFINITE_SCROLL_PAGINATION_RESULTS
            ? posts[posts.length - 1].id
            : undefined,
      }}
      session={null}
    />
  );
};

export default GeneralFeed;
