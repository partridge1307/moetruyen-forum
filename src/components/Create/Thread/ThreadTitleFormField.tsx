import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import type { CreateThreadPayload } from '@/lib/validators/forum';
import { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';

interface ThreadTitleFieldProps {
  form: UseFormReturn<CreateThreadPayload>;
}

const ThreadTitleField: FC<ThreadTitleFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tên cộng đồng</FormLabel>
          <FormControl>
            <div className="relative">
              <p className="absolute left-2 w-8 inset-y-0 text-sm grid place-content-center">
                m/
              </p>
              <Input className="pl-10" {...field} />
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ThreadTitleField;
