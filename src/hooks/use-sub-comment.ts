import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useCustomToast } from './use-custom-toast';

export const useSubComments = <TData>(commentId: number, APIQuery: string) => {
  const { serverErrorToast } = useCustomToast();

  return useQuery({
    queryKey: [`sub-comment-query`, commentId],
    queryFn: async () => {
      const { data } = await axios.get(`${APIQuery}/${commentId}/sub-comment`);

      return data as TData[];
    },
    onError: () => {
      return serverErrorToast();
    },
    refetchInterval: 15000,
  });
};
