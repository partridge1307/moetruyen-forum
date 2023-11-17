'use client';

import { PostTypeEnum, SortByEnum, usePosts } from '@/hooks/use-post';
import { useIntersection } from '@mantine/hooks';
import type { Post, PostVote, SubForum, User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import PostCard from './PostCard';

export type Posts = Pick<Post, 'id' | 'title' | 'content' | 'createdAt'> & {
  votes: PostVote[];
  author: Pick<User, 'name' | 'image' | 'color'>;
  subForum: Pick<SubForum, 'slug' | 'title'>;
  _count: {
    comments: number;
  };
};

type initialPostProps = {
  posts: Posts[];
  lastCursor?: number;
};

interface indexProps {
  initialPosts: initialPostProps;
  type: keyof typeof PostTypeEnum | number;
}

const sortByItems: {
  value: SortByEnum;
  content: string;
}[] = [
  {
    value: SortByEnum.DESC,
    content: 'Mới nhất',
  },
  {
    value: SortByEnum.HOT,
    content: 'Hàng đầu',
  },
  {
    value: SortByEnum.ASC,
    content: 'Lâu nhất',
  },
];

const Feed: FC<indexProps> = ({ initialPosts, type }) => {
  const { data: session } = useSession();
  const lastPostRef = useRef(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { posts, sortBy, setSortBy, query } = usePosts<Posts>({
    initialPosts,
    type,
  });

  useEffect(() => {
    if (entry?.isIntersecting && query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [entry?.isIntersecting, query]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bài viết</h1>
        <Select
          defaultValue={sortBy}
          onValueChange={(value) => {
            setSortBy(value as SortByEnum);
            setTimeout(() => query.refetch(), 0);
          }}
        >
          <SelectTrigger
            className="w-fit rounded-full space-x-1 focus:ring-transparent ring-offset-transparent"
            aria-label="sort by button"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {sortByItems.map((item, idx) => (
              <SelectItem
                key={idx}
                ref={(ref) => {
                  if (!ref) return;
                  ref.ontouchstart = (e) => {
                    e.preventDefault();
                  };
                }}
                aria-label={item.content}
                value={item.value}
                className="hover:cursor-pointer"
              >
                {item.content}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ul className="space-y-10">
        {posts.map((post, idx) => {
          if (idx === posts.length - 1)
            return (
              <PostCard ref={ref} key={post.id} post={post} session={session} />
            );
          else return <PostCard key={post.id} post={post} session={session} />;
        })}
      </ul>
    </div>
  );
};

export default Feed;
