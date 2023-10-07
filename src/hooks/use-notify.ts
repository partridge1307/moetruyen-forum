import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';

const useNotify = <TData>() => {
  const [notifies, setNotifies] = useState<TData[]>([]);

  const query = useInfiniteQuery({
    queryKey: ['infinite-notify-query'],
    queryFn: async ({ pageParam }) => {
      let query = `/api/notify?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}`;

      if (pageParam) {
        query = `${query}&cursor=${pageParam}`;
      }

      const { data } = await axios.get(query);

      return data as { notifications: TData[]; lastCursor: number };
    },
    getNextPageParam: (lastPage) => lastPage.lastCursor ?? false,
    refetchInterval: 5000,
  });

  useEffect(() => {
    const notifies = query.data?.pages.flatMap((page) => page.notifications);

    if (notifies) {
      setNotifies(notifies);
    }
  }, [query.data?.pages]);

  return { notifies, ...query };
};

export { useNotify };
