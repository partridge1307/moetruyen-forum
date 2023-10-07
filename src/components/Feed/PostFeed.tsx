'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { usePosts } from '@/hooks/use-post';
import { useIntersection } from '@mantine/hooks';
import type { Post, PostVote, SubForum, User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { FC, useEffect, useRef, useState } from 'react';

const PostCard = dynamic(() => import('@/components/PostCard'), {
  ssr: false,
  loading: () => (
    <div className="p-4 rounded-md animate-pulse dark:bg-zinc-900">
      <div className="w-full h-96" />
    </div>
  ),
});

export type ExtendedPost = Pick<
  Post,
  'id' | 'title' | 'content' | 'createdAt'
> & {
  subForum: Pick<SubForum, 'title' | 'slug'>;
  author: Pick<User, 'name' | 'color' | 'image'>;
  votes: PostVote[];
  _count: {
    comments: number;
  };
};

interface PostFeedProps {
  subForumId?: number;
  initialPosts: { posts: ExtendedPost[]; lastCursor?: number };
  session: Session | null;
}

const PostFeed: FC<PostFeedProps> = ({ subForumId, initialPosts, session }) => {
  const [sortBy, setSortBy] = useState<'asc' | 'desc' | 'hot'>('hot');

  const lastPostRef = useRef<HTMLLIElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = usePosts<ExtendedPost>(`/api/m`, initialPosts, sortBy, subForumId);

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, fetchNextPage, hasNextPage]);

  useEffect(() => {
    refetch();
  }, [refetch, sortBy]);

  const posts =
    postsData?.pages.flatMap((page) => page.posts) ?? initialPosts.posts;

  return (
    <>
      <div className="flex justify-end">
        <Select
          defaultValue={sortBy}
          onValueChange={(value) => setSortBy(value as 'asc' | 'desc' | 'hot')}
        >
          <SelectTrigger
            className="w-fit focus:ring-transparent ring-offset-transparent bg-transparent"
            aria-label="sort by button"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="center" className="dark:bg-zinc-900">
            <SelectItem
              ref={(ref) => {
                if (!ref) return;
                ref.ontouchstart = (e) => {
                  e.preventDefault();
                };
              }}
              value="hot"
              className="hover:cursor-pointer"
              aria-label="hot"
            >
              Hàng đầu
            </SelectItem>
            <SelectItem
              ref={(ref) => {
                if (!ref) return;
                ref.ontouchstart = (e) => {
                  e.preventDefault();
                };
              }}
              value="asc"
              className="hover:cursor-pointer"
              aria-label="oldest"
            >
              Cũ nhất
            </SelectItem>
            <SelectItem
              ref={(ref) => {
                if (!ref) return;
                ref.ontouchstart = (e) => {
                  e.preventDefault();
                };
              }}
              value="desc"
              className="hover:cursor-pointer"
              aria-label="newest"
            >
              Mới nhất
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ul className="divide-y-2 rounded-md dark:divide-zinc-700 dark:bg-zinc-900/60">
        {posts.length ? (
          posts.map((post, idx) => {
            const voteAmt = post.votes.reduce((acc, vote) => {
              if (vote.type === 'UP_VOTE') return acc + 1;
              if (vote.type === 'DOWN_VOTE') return acc - 1;
              return acc;
            }, 0);
            const currentVote = post.votes.find(
              (vote) => vote.userId === session?.user.id
            )?.type;

            if (idx === posts.length - 1) {
              return (
                <li ref={ref} key={post.id} className="pt-4">
                  <PostCard
                    subForumSlug={post.subForum.slug}
                    post={post}
                    voteAmt={voteAmt}
                    currentVote={currentVote}
                  />
                </li>
              );
            } else {
              return (
                <li key={post.id} className="py-4">
                  <PostCard
                    subForumSlug={post.subForum.slug}
                    post={post}
                    voteAmt={voteAmt}
                    currentVote={currentVote}
                  />
                </li>
              );
            }
          })
        ) : (
          <li className="p-2">Không có bài viết</li>
        )}
      </ul>

      {isFetchingNextPage && (
        <p className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </p>
      )}
    </>
  );
};

export default PostFeed;
