'use client';

import useDeleteComment from '@/hooks/use-delete-comment';
import { Loader2, X } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { memo } from 'react';
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

export type DeleteCommentProps<TData> = {
  commentId: number;
  APIQuery: string;
  isSending?: boolean;
  setComments: Dispatch<SetStateAction<TData[]>>;
} & React.HTMLAttributes<HTMLButtonElement>;

function DeleteComment<TData>({
  commentId,
  APIQuery,
  isSending,
  setComments,
  ...props
}: DeleteCommentProps<TData>) {
  const { mutate: Delete, isLoading: isDeleting } = useDeleteComment({
    commentId,
    APIQuery,
    setComments,
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={isDeleting || isSending}
        className="hover:bg-red-500 text-red-500 hover:text-white transition-colors p-2 rounded-md"
        {...props}
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
}

export default memo(DeleteComment) as typeof DeleteComment;
