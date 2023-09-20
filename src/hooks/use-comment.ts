import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useComments = <TData>(id: number, APIQuery: string) =>
  useInfiniteQuery(
    ['infinite-comments-query', id],
    async ({ pageParam }) => {
      let query = `${APIQuery}?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}`;

      if (pageParam) {
        query = `${query}&cursor=${pageParam}`;
      }

      const { data } = await axios.get(query);

      return data as {
        comments: TData[];
        lastCursor: number | undefined;
      };
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.lastCursor ?? false;
      },
    }
  );
