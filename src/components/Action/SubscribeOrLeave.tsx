'use client';

import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { Button } from '@/components/ui/Button';
import axios, { AxiosError } from 'axios';
import { CreateSubscriptionPayload } from '@/lib/validators/forum';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface SubscribeOrLeaveProps {
  subForumId: number;
  isSubscribed: boolean;
}

const SubscribeOrLeave: FC<SubscribeOrLeaveProps> = ({
  subForumId,
  isSubscribed,
}) => {
  const router = useRouter();
  const { serverErrorToast, loginToast, notFoundToast } = useCustomToast();

  const { mutate: toggleSubscription, isLoading: isTogglingSubscription } =
    useMutation({
      mutationFn: async (type: 'SUBSCRIBE' | 'UNSUBSCRIBE') => {
        const payload: CreateSubscriptionPayload = {
          type,
          subForumId,
        };
        await axios.post(`/api/m/subscription`, payload);
      },
      onError: (err) => {
        if (err instanceof AxiosError) {
          if (err.response?.status === 401) return loginToast();
          if (err.response?.status === 404) return notFoundToast();
          if (err.response?.status === 406)
            return toast({
              title: 'Đã gia nhập',
              description: 'Bạn đã gia nhập Forum này rồi',
              variant: 'destructive',
            });
        }
        return serverErrorToast();
      },
      onSuccess: () => {
        return router.refresh();
      },
    });

  return isSubscribed ? (
    <Button
      variant={'destructive'}
      className="w-full"
      onClick={() => toggleSubscription('UNSUBSCRIBE')}
      disabled={isTogglingSubscription}
    >
      Rời bỏ
    </Button>
  ) : (
    <Button
      className="w-full"
      onClick={() => toggleSubscription('SUBSCRIBE')}
      disabled={isTogglingSubscription}
    >
      Gia nhập
    </Button>
  );
};

export default SubscribeOrLeave;
