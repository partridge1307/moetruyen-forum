import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { CreatePostPayload } from '@/lib/validators/forum';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';

interface PostTitleFormFieldProps {
  form: UseFormReturn<CreatePostPayload>;
}

const PostTitleFormField: FC<PostTitleFormFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tiêu đề</FormLabel>
          <FormMessage />
          <FormControl>
            <ReactTextareaAutosize
              ref={field.ref}
              autoFocus
              placeholder="Tiêu đề"
              className="resize-none text-lg w-full p-2 rounded-md bg-background"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default PostTitleFormField;
