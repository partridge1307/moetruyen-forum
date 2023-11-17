import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useSubComments = <TData>(commentId: number) =>
  useQuery({
    queryKey: [`sub-comment-query`, commentId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/comment/${commentId}/sub-comment`);

      return data as TData[];
    },
    refetchOnWindowFocus: false,
  });
