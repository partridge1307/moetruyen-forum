import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import type {
  CreateThreadPayload,
  EditThreadPayload,
} from '@/lib/validators/forum';
import { FC } from 'react';
import type { Control, UseFormReturn } from 'react-hook-form';

type ThreadTitleFieldProps = {
  form: UseFormReturn<CreateThreadPayload> | UseFormReturn<EditThreadPayload>;
};

const ThreadTitleField: FC<ThreadTitleFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control as Control<CreateThreadPayload | EditThreadPayload>}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormMessage />
          <FormLabel>Tên cộng đồng</FormLabel>
          <FormControl>
            <div className="relative">
              <p className="absolute left-2 w-8 inset-y-0 text-sm grid place-content-center">
                m/
              </p>
              <Input className="pl-10" {...field} />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ThreadTitleField;
