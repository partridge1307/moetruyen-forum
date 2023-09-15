'use client';

import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { CreatePostPayload, CreatePostValidator } from '@/lib/validators/forum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import PostContentFormField from './PostContentFormField';
import PostTitleFormField from './PostTitleFormField';

interface CreatePostFormProps {
  id: number;
}

const CreatePostForm: FC<CreatePostFormProps> = ({ id }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const form = useForm<CreatePostPayload>({
    resolver: zodResolver(CreatePostValidator),
    defaultValues: {
      title: '',
      content: undefined,
    },
  });

  const { mutate: Upload, isLoading: isUploading } = useMutation({
    mutationFn: async (values: CreatePostPayload) => {
      await axios.post(`/api/m/${id}`, values);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }
      return serverErrorToast();
    },
    onSuccess: () => {
      router.back();
      router.refresh();

      return successToast();
    },
  });

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function onSubmit(values: CreatePostPayload) {
    Upload(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <PostTitleFormField form={form} />
        <PostContentFormField form={form} />

        <div className="flex justify-end items-center gap-8">
          <Button
            tabIndex={0}
            disabled={isUploading}
            type="button"
            variant={'destructive'}
            onClick={() => router.back()}
          >
            Trở về
          </Button>
          <Button
            tabIndex={1}
            disabled={isUploading}
            isLoading={isUploading}
            type="submit"
          >
            Đăng
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreatePostForm;
