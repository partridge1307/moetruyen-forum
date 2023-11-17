'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { EditThreadPayload } from '@/lib/validators/forum';
import { useDebouncedValue } from '@mantine/hooks';
import { X } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface ThreadManagerFormFieldProps {
  form: UseFormReturn<EditThreadPayload>;
  subForumId: number;
}

type UsersResultType = {
  id: string;
  name?: string | null;
};

const userCached = new Map<string, UsersResultType[] | null>(null);

const userLookUpService = {
  search: async (
    query: string,
    subForumId: number,
    callback: (results: UsersResultType[]) => void
  ): Promise<void> => {
    fetch(`/api/m/${subForumId}/user?q=${query}`, { method: 'GET' })
      .then((res) => {
        if (res.ok) return res.json() as Promise<UsersResultType[]>;
        else return null;
      })
      .then((res) => {
        if (!res) return;
        return callback(res);
      });
  },
};

const ThreadManagerFormField: FC<ThreadManagerFormFieldProps> = ({
  form,
  subForumId,
}) => {
  const [userInput, setUserInput] = useState('');
  const [debouncedValue] = useDebouncedValue(userInput, 300);
  const [userResults, setUserResults] = useState<UsersResultType[]>([]);
  const [usersSelected, setUsersSelected] = useState<UsersResultType[]>(
    form.getValues('managers')
  );

  useEffect(() => {
    if (debouncedValue.length) {
      const cachedResults = userCached.get(debouncedValue);

      if (cachedResults === null) {
        return;
      }

      if (cachedResults !== undefined) {
        setUserResults(cachedResults);
        return;
      }

      userCached.set(debouncedValue, null);
      userLookUpService.search(debouncedValue, subForumId, (results) => {
        userCached.set(debouncedValue, results);
        setUserResults(results);
      });
    }
  }, [debouncedValue, subForumId]);

  return (
    <FormField
      control={form.control}
      name="managers"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Quản lý</FormLabel>
          <FormMessage />
          <FormControl>
            <div className="flex flex-wrap items-center rounded-md border border-input bg-background">
              <ul className="text-sm flex flex-wrap items-center gap-3 ml-1">
                {usersSelected.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center gap-1 p-1 rounded-lg bg-primary-foreground"
                  >
                    {user.name}
                    <div
                      role="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const updatedUsersSelected = usersSelected.filter(
                          (u) => u !== user
                        );

                        field.onChange(updatedUsersSelected);
                        setUsersSelected(updatedUsersSelected);
                      }}
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </div>
                  </li>
                ))}
              </ul>
              <Input
                placeholder="Nhập tên thành viên"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 bg-inherit border-none focus-visible:ring-offset-0 focus-visible:ring-0"
              />
            </div>
          </FormControl>
          {!!debouncedValue.length && !userResults.length && (
            <p>Không có kết quả</p>
          )}
          {!!debouncedValue.length && !!userResults.length && (
            <ul className="text-sm flex flex-wrap items-center gap-3">
              {userResults
                .filter((user) => !usersSelected.includes(user))
                .map((user) => (
                  <li
                    role="button"
                    key={user.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const existed = usersSelected.includes(user);
                      if (!existed) {
                        const updatedUsersSelected = [...usersSelected, user];

                        field.onChange(updatedUsersSelected);
                        setUsersSelected(updatedUsersSelected);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-muted hover:cursor-pointer"
                  >
                    {user.name}
                  </li>
                ))}
            </ul>
          )}
        </FormItem>
      )}
    />
  );
};

export default ThreadManagerFormField;
