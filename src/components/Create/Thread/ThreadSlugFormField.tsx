import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { CreateThreadPayload, EditThreadPayload } from '@/lib/validators/forum';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

type ThreadSlugFormFieldProps =
  | {
      type: 'CREATE';
      form: UseFormReturn<CreateThreadPayload>;
    }
  | { type: 'EDIT'; form: UseFormReturn<EditThreadPayload> };

const ThreadSlugFormField: FC<ThreadSlugFormFieldProps> = ({ type, form }) => {
  return type === 'CREATE' ? (
    <FormField
      control={form.control}
      name="slug"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Slug</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="Slug" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  ) : (
    <FormField
      control={form.control}
      name="slug"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Slug</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="Slug" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ThreadSlugFormField;
