import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo, useState } from 'react';

export enum SortByEnum {
  HOT = 'hot',
  ASC = 'asc',
  DESC = 'desc',
}

export enum PostTypeEnum {
  GENERAL = 'GENERAL',
  FOLLOW = 'FOLLOW',
}

export const usePosts = <TData>({
  initialPosts,
  type,
}: {
  initialPosts: { posts: TData[]; lastCursor?: number };
  type: keyof typeof PostTypeEnum | number;
}) => {
  const [sortBy, setSortBy] = useState<SortByEnum>(SortByEnum.DESC);

  const query = useInfiniteQuery(
    ['post-infinite-query', type],
    async ({ pageParam }) => {
      let query;

      if (typeof type === 'number') {
        query = `/api/m/post/${type}?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&sortBy=${sortBy}`;
      } else {
        query = `/api/m/post?tab=${type}&limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&sortBy=${sortBy}`;
      }

      if (!!pageParam) {
        query = `${query}&cursor=${pageParam}`;
      }

      const { data } = await axios.get(query);
      return data as { posts: TData[]; lastCursor: number };
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.lastCursor ?? null;
      },
      initialData: {
        pages: [initialPosts],
        pageParams: [initialPosts.lastCursor],
      },
    }
  );

  const posts = useMemo(() => {
    return (
      query.data?.pages.flatMap((page) => page.posts) ?? initialPosts.posts
    );
  }, [query.data?.pages, initialPosts]);

  return {
    sortBy,
    setSortBy,
    query,
    posts,
  };
};
