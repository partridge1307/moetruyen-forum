import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { CreatePostPayload } from '@/lib/validators/forum';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

const MoetruyenEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-28 rounded-md animate-pulse dark:bg-zinc-900" />
    ),
  }
);

interface PostContentFormFieldProps {
  form: UseFormReturn<CreatePostPayload>;
}

const PostContentFormField: FC<PostContentFormFieldProps> = ({ form }) => {
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
              onChange={(editorState) => field.onChange(editorState.toJSON())}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default PostContentFormField;
