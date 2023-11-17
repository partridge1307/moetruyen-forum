'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';

type DeleteCommentProps<TData> = {
  commentId: number;
  APIQuery: string;
  setComments: Dispatch<SetStateAction<TData[]>>;
};

const useDeleteComment = <TData>({
  commentId,
  APIQuery,
  setComments,
}: DeleteCommentProps<TData>) => {
  const { loginToast, notFoundToast, serverErrorToast } = useCustomToast();

  return useMutation({
    mutationKey: ['delete-comment', commentId],
    mutationFn: async () => {
      await axios.delete(APIQuery);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      // @ts-expect-error
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    },
  });
};

export default useDeleteComment;
