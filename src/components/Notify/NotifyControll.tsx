'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { CheckCheck, Trash2 } from 'lucide-react';
import type { Dispatch, FC, SetStateAction } from 'react';
import { ExtendedNotify } from '.';
import { Button } from '../ui/Button';

interface NotifyControllProps {
  setNotifies: Dispatch<SetStateAction<ExtendedNotify[]>>;
}

const NotifyControll: FC<NotifyControllProps> = ({ setNotifies }) => {
  const { loginToast, serverErrorToast, successToast } = useCustomToast();

  const { mutate: CheckAll, isLoading: isChecking } = useMutation({
    mutationKey: ['notify-read-all'],
    mutationFn: async () => {
      await axios.put('/api/notify');
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      setNotifies((notifies) =>
        notifies.map((notify) => {
          notify.isRead = true;

          return notify;
        })
      );

      return successToast();
    },
  });

  const { mutate: DeleteAll, isLoading: isDeleting } = useMutation({
    mutationKey: ['notify-delete-all'],
    mutationFn: async () => {
      await axios.delete('/api/notify');
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      setNotifies([]);

      return successToast();
    },
  });

  return (
    <div className="flex flex-wrap justify-between gap-2">
      <Button
        isLoading={isChecking}
        disabled={isChecking || isDeleting}
        size={'sm'}
        variant={'ghost'}
        className="space-x-2"
        onClick={() => CheckAll()}
      >
        <CheckCheck />
        <span>Đã đọc tất cả</span>
      </Button>

      <Button
        isLoading={isDeleting}
        disabled={isChecking || isDeleting}
        size={'sm'}
        variant={'destructive'}
        className="space-x-2"
        onClick={() => DeleteAll()}
      >
        <Trash2 />
        <span>Xóa hết</span>
      </Button>
    </div>
  );
};

export default NotifyControll;
