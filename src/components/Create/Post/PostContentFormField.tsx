import EditorSkeleton from '@/components/Skeleton/EditorSkeleton';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { CreatePostPayload } from '@/lib/validators/forum';
import type { Prisma } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

const MoetruyenEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditor'),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  }
);

interface PostContentFormFieldProps {
  form: UseFormReturn<CreatePostPayload>;
  initialContent?: Prisma.JsonValue;
}

const PostContentFormField: FC<PostContentFormFieldProps> = ({
  form,
  initialContent,
}) => {
  return (
    <FormField
      control={form.control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nội dung</FormLabel>
          <FormMessage />
          <FormControl>
            <MoetruyenEditor
              placeholder="Nhập nội dung"
              initialContent={initialContent}
              onChange={(editorState) => field.onChange(editorState.toJSON())}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default PostContentFormField;
