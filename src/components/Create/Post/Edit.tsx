'use client';

import { Form } from '@/components/ui/Form';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { CreatePostPayload, CreatePostValidator } from '@/lib/validators/forum';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Post, SubForum } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { FC, useRef } from 'react';
import { useForm } from 'react-hook-form';
import PostTitleFormField from './PostTitleFormField';
import PostContentFormField from './PostContentFormField';
import axios, { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { $getRoot, type LexicalEditor } from 'lexical';

interface EditProps {
  post: Pick<Post, 'id' | 'content' | 'title' | 'plainTextContent'> & {
    subForum: Pick<SubForum, 'slug'>;
  };
}

const PostEdit: FC<EditProps> = ({ post }) => {
  const router = useRouter();
  const { serverErrorToast, loginToast, notFoundToast, successToast } =
    useCustomToast();
  const editorRef = useRef<LexicalEditor>(null);

  const form = useForm<CreatePostPayload>({
    resolver: zodResolver(CreatePostValidator),
    defaultValues: {
      title: post.title,
      // @ts-ignore
      content: post.content,
      description: post.plainTextContent,
    },
  });

  const { mutate: Update, isLoading: isUpdating } = useMutation({
    mutationFn: async (values: CreatePostPayload) => {
      await axios.patch(`/api/m/${post.id}`, values);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push(`/m/${post.subForum.slug}/${post.id}`);
      router.refresh();

      return successToast();
    },
  });

  function onSubmitHandler(values: CreatePostPayload) {
    let payload: CreatePostPayload = {
      title: values.title,
      content: values.content ?? post.content,
    };
    const editorState = editorRef.current?.getEditorState();
    editorState?.read(() => {
      const textContent = $getRoot().getTextContent();
      payload.plainTextContent = textContent;
    });

    Update(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <PostTitleFormField form={form} />
        <PostContentFormField
          editorRef={editorRef}
          form={form}
          initialContent={post.content}
        />

        <div className="flex justify-end items-center gap-8">
          <Button
            tabIndex={0}
            disabled={isUpdating}
            type="button"
            variant={'destructive'}
            onClick={() => router.back()}
          >
            Trở về
          </Button>
          <Button
            tabIndex={1}
            disabled={isUpdating}
            isLoading={isUpdating}
            type="submit"
          >
            Sửa
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostEdit;
