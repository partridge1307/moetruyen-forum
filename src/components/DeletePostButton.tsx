'use client';

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
} from './ui/AlertDialog';
import { Trash2 } from 'lucide-react';
import { buttonVariants } from './ui/Button';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { useRouter } from 'next/navigation';

interface DeletePostButtonProps {
  postId: number;
  subForumSlug: string;
}

const DeletePostButton: FC<DeletePostButtonProps> = ({
  postId,
  subForumSlug,
}) => {
  const { loginToast, successToast, notFoundToast, serverErrorToast } =
    useCustomToast();
  const router = useRouter();

  const { mutate: Delete, isLoading: isDeleting } = useMutation({
    mutationKey: ['delete-post-button', postId],
    mutationFn: async () => {
      await axios.delete(`/api/m/${postId}`);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push(`/${subForumSlug}`);
      router.refresh();

      return successToast();
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={isDeleting}
        className={buttonVariants({ variant: 'ghost' })}
      >
        <Trash2 aria-label="delete post button" className="text-red-500" />
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Bạn có chắc chắn muốn xóa bài viết này?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Không thể khôi phục bài viết sau khi xóa
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            className={buttonVariants({ variant: 'destructive' })}
          >
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} onClick={() => Delete()}>
            Chắc chắn
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePostButton;
