'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Loader2, X } from 'lucide-react';
import { FC } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../ui/AlertDialog';
import { buttonVariants } from '../../ui/Button';

interface DeleteCommentProps {
  commentId: number;
  callbackURL: string;
}

const DeleteComment: FC<DeleteCommentProps> = ({ commentId, callbackURL }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const { mutate: Delete, isLoading: isDeleting } = useMutation({
    mutationKey: ['delete-comment', commentId],
    mutationFn: async () => {
      await axios.delete(`${callbackURL}/${commentId}`);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      return successToast();
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={isDeleting}
        className="hover:bg-red-500 text-red-500 hover:text-white transition-colors p-2 rounded-md"
      >
        {isDeleting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <X className="w-5 h-5" />
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận lại yêu cầu</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa bình luận này?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            className={buttonVariants({ variant: 'destructive' })}
          >
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => Delete()}>Xóa</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteComment;
