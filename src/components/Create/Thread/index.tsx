'use client';

import ThreadImageSkeleton from '@/components/Skeleton/ThreadImageSkeleton';
import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import {
  CreateThreadPayload,
  CreateThreadValidator,
} from '@/lib/validators/forum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import ThreadCanSendField from './ThreadCanSendFormField';
import ThreadSlugFormField from './ThreadSlugFormField';
import ThreadTitleField from './ThreadTitleFormField';

const ThreadThumbnailField = dynamic(() => import('./ThreadImageFormField'), {
  ssr: false,
  loading: () => <ThreadImageSkeleton />,
});

const Thread = () => {
  const router = useRouter();
  const { loginToast, verifyToast, serverErrorToast, successToast } =
    useCustomToast();

  const form = useForm<CreateThreadPayload>({
    resolver: zodResolver(CreateThreadValidator),
    defaultValues: {
      thumbnail: '',
      title: '',
      slug: '',
      canSend: true,
    },
  });

  const { mutate: Create, isLoading: isCreating } = useMutation({
    mutationFn: async (values: CreateThreadPayload) => {
      const { thumbnail, title, slug, canSend } = values;

      const form = new FormData();

      if (thumbnail) {
        const blob = await fetch(thumbnail).then((res) => res.blob());
        form.append('thumbnail', blob);
      }
      !!slug && form.append('slug', slug);
      form.append('title', title);
      form.append('canSend', canSend ? 'true' : 'false');

      const { data } = await axios.post('/api/m', form);

      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return verifyToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Đã tồn tại',
            description: 'Đã tồn tại cộng đồng này rồi',
            variant: 'destructive',
          });
        if (err.response?.status === 400)
          return toast({
            title: 'Slug đã tồn tại',
            description: 'Đã tồn tại Slug này rồi',
            variant: 'destructive',
          });
        if (err.response?.status === 409)
          return toast({
            title: 'Chưa đủ điều kiện',
            description: 'Tài khoản chưa đủ điều kiện tạo Forum',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: (data) => {
      router.push(`/m/${data}`);
      router.refresh();

      return successToast();
    },
  });

  function onSubmitHandler(values: CreateThreadPayload) {
    Create(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <ThreadThumbnailField form={form} />
        <ThreadTitleField form={form} />
        <ThreadSlugFormField form={form} />
        <ThreadCanSendField form={form} />

        <div className="flex justify-end gap-4">
          <Button
            tabIndex={0}
            type="button"
            disabled={isCreating}
            variant={'destructive'}
            className="px-6"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
          <Button
            tabIndex={1}
            disabled={isCreating}
            isLoading={isCreating}
            type="submit"
            className="px-6"
          >
            Tạo
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default Thread;
