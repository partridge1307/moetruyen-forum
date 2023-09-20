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
} from '@/components/ui/AlertDialog';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/Button';

interface DeleteThreadButtonProps {
  subForumId: number;
}

const DeleteThreadButton: FC<DeleteThreadButtonProps> = ({ subForumId }) => {
  const router = useRouter();
  const { serverErrorToast, loginToast, notFoundToast, successToast } =
    useCustomToast();

  const { mutate: Delete, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      await axios.delete('/api/m', { data: { subForumId } });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push('/');
      router.refresh();

      return successToast();
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={isDeleting}
        className={cn(buttonVariants({ variant: 'destructive' }), 'w-full')}
      >
        Xóa
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận lại yêu cầu</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn <span className="font-semibold">xóa</span>{' '}
            cộng đồng này? (Không thể khôi phục)
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={() => Delete()}>
            Chắc chắn
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteThreadButton;
