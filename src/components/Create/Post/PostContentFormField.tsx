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
import type { LexicalEditor } from 'lexical';
import dynamic from 'next/dynamic';
import type { FC, RefObject } from 'react';
import { UseFormReturn } from 'react-hook-form';

const MoetruyenEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditor'),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  }
);

interface PostContentFormFieldProps {
  editorRef: RefObject<LexicalEditor>;
  form: UseFormReturn<CreatePostPayload>;
  initialContent?: Prisma.JsonValue;
}

const PostContentFormField: FC<PostContentFormFieldProps> = ({
  editorRef,
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
              editorRef={editorRef}
              placeholder="Nhập nội dung"
              initialContent={initialContent}
              onChange={(editorState) => {
                field.onChange(editorState.toJSON());
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default PostContentFormField;
