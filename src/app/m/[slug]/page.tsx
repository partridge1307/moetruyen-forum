import Feed from '@/components/Feed';
import PostInput from '@/components/Feed/PostInput';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FC } from 'react';

interface pageProps {
  params: {
    slug: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const forum = await db.subForum.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      id: true,
    },
  });
  if (!forum) return notFound();

  const posts = await db.post.findMany({
    where: {
      subForum: {
        id: forum.id,
      },
    },
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

  return (
    <>
      <PostInput slug={params.slug} />
      <Feed
        initialPosts={{
          posts,
          lastCursor:
            posts.length === INFINITE_SCROLL_PAGINATION_RESULTS
              ? posts[posts.length - 1].id
              : undefined,
        }}
        type={forum.id}
      />
    </>
  );
};

export default page;
