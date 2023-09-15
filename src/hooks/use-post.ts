import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

export const usePosts = <TData>(
  APIQuery: string,
  initialPosts: { posts: TData[]; lastCursor?: number },
  sortBy: 'asc' | 'desc' | 'hot',
  id?: number
) =>
  useInfiniteQuery(
    ['post-infinite-query', id],
    async ({ pageParam }) => {
      let query;

      if (id) {
        query = `${APIQuery}/${id}?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&sortBy=${sortBy}`;
      } else {
        query = `${APIQuery}?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&sortBy=${sortBy}`;
      }

      if (pageParam) {
        query = `${query}&cursor=${pageParam}`;
      }

      const { data } = await axios.get(query);
      return data as { posts: TData[]; lastCursor: number };
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.lastCursor ?? false;
      },
      initialData: {
        pages: [initialPosts],
        pageParams: [initialPosts.lastCursor],
      },
    }
  );
