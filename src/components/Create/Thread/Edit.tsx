'use client';

import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { useCustomToast } from '@/hooks/use-custom-toast';
import {
  CreateThreadPayload,
  CreateThreadValidator,
} from '@/lib/validators/forum';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SubForum } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import ThreadCanSendField from './ThreadCanSendFormField';
import ThreadSlugFormField from './ThreadSlugFormField';
import ThreadTitleField from './ThreadTitleFormField';

const ThreadImageForm = dynamic(() => import('./ThreadImageFormField'), {
  ssr: false,
});

interface EditProps {
  subForum: Pick<SubForum, 'id' | 'slug' | 'title' | 'banner' | 'canSend'>;
}

const Edit: FC<EditProps> = ({ subForum }) => {
  const router = useRouter();
  const { loginToast, serverErrorToast, notFoundToast, successToast } =
    useCustomToast();

  const form = useForm<CreateThreadPayload>({
    resolver: zodResolver(CreateThreadValidator),
    defaultValues: {
      slug: subForum.slug,
      title: subForum.title,
      thumbnail: subForum.banner ?? undefined,
      canSend: subForum.canSend,
    },
  });

  const { mutate: Update, isLoading: isUpdating } = useMutation({
    mutationFn: async (values: CreateThreadPayload) => {
      const { thumbnail, title, slug, canSend } = values;

      const form = new FormData();
      if (thumbnail?.startsWith('blob')) {
        const blob = await fetch(thumbnail).then((res) => res.blob());
        form.append('thumbnail', blob);
      }
      !!slug && form.append('slug', slug);
      form.append('title', title);
      form.append('canSend', canSend ? 'true' : 'false');

      const { data } = await axios.put(`/api/m/${subForum.id}`, form);

      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }
      return serverErrorToast();
    },
    onSuccess: (data) => {
      router.push(`/${data}`);
      router.refresh();

      return successToast();
    },
  });

  function onSubmitHandler(values: CreateThreadPayload) {
    Update(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <ThreadImageForm form={form} />
        <ThreadTitleField form={form} />
        <ThreadSlugFormField form={form} />
        <ThreadCanSendField form={form} />

        <div className="flex justify-end gap-4">
          <Button
            tabIndex={0}
            type="button"
            disabled={isUpdating}
            variant={'destructive'}
            className="px-6"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
          <Button
            tabIndex={1}
            disabled={isUpdating}
            isLoading={isUpdating}
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

export default Edit;
