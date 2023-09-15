import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useComments = <TData>(id: number, APIQuery: string) =>
  useInfiniteQuery(
    ['comment-infinite-query', id],
    async ({ pageParam = 1 }) => {
      const query = `${APIQuery}/${id}?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}`;

      const { data } = await axios.get(query);
      return data as { comments: TData[]; lastCursor: number };
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.lastCursor ?? false;
      },
    }
  );
