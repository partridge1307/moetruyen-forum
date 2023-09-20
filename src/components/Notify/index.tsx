'use client';

import Follow from '@/components/Notify/Follow';
import General from '@/components/Notify/General';
import System from '@/components/Notify/System';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import type { Notify } from '@prisma/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Bell } from 'lucide-react';
import type { Session } from 'next-auth';
import { useEffect, useState } from 'react';

export type ExtendedNotify = Pick<
  Notify,
  'id' | 'type' | 'createdAt' | 'content' | 'endPoint' | 'isRead'
>;

const Notifications = ({ session }: { session: Session }) => {
  const [generalNotify, setGeneralNotify] = useState<ExtendedNotify[]>([]);
  const [followNotify, setFollowNotify] = useState<ExtendedNotify[]>([]);
  const [systemNotify, setSystemNotify] = useState<ExtendedNotify[]>([]);

  const {
    data: notifyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    ['notify-infinite-query'],
    async ({ pageParam }) => {
      let query = `/api/notify?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}`;
      if (pageParam) {
        query = `/api/notify?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&cursor=${pageParam}`;
      }

      const { data } = await axios.get(query);
      return data as { notifications: ExtendedNotify[]; lastCursor: number };
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.lastCursor ?? false;
      },
      refetchInterval: 5000,
    }
  );

  useEffect(() => {
    const notifies = notifyData?.pages.flatMap((page) => page.notifications);

    if (notifies) {
      const general = notifies.filter(
        (notify) => notify.type === 'COMMENT' || notify.type === 'CHAT'
      );
      const follow = notifies.filter((notify) => notify.type === 'FOLLOW');
      const system = notifies.filter((notify) => notify.type === 'SYSTEM');

      setGeneralNotify(general);
      setFollowNotify(follow);
      setSystemNotify(system);
    }
  }, [notifyData?.pages]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="relative">
          <Bell aria-label="Notify button" className="w-7 h-7" />
          {(!!generalNotify.some((notify) => !notify.isRead) ||
            !!followNotify.some((notify) => !notify.isRead)) && (
            <span className="absolute w-3 h-3 rounded-full top-0 right-0 animate-pulse dark:bg-red-600" />
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="dark:bg-zinc-800 p-1 space-y-2"
      >
        <DropdownMenuLabel className="text-center text-lg dark:text-white">
          Thông báo
        </DropdownMenuLabel>

        {(!!generalNotify.length ||
          !!followNotify.length ||
          !!systemNotify.length) && (
          <Button
            size={'sm'}
            variant={'destructive'}
            className="w-full"
            onClick={() =>
              fetch(`/api/notify`, { method: 'DELETE' }).then(() => refetch())
            }
          >
            Xóa
          </Button>
        )}

        <Tabs defaultValue="general">
          <TabsList className="dark:bg-zinc-900 grid grid-cols-3 gap-2">
            <TabsTrigger value="general" className="relative">
              Chung
              {!!generalNotify.some((notify) => !notify.isRead) && (
                <span className="absolute w-3 h-3 rounded-full top-0 right-0 animate-pulse dark:bg-red-600" />
              )}
            </TabsTrigger>
            <TabsTrigger value="follow" className="relative">
              Theo dõi
              {!!followNotify.some((notify) => !notify.isRead) && (
                <span className="absolute w-3 h-3 rounded-full top-0 right-0 animate-pulse dark:bg-red-600" />
              )}
            </TabsTrigger>
            <TabsTrigger value="system" className="relative">
              Hệ thống
              {!!systemNotify.some((notify) => !notify.isRead) && (
                <span className="absolute w-3 h-3 rounded-full top-0 right-0 animate-pulse dark:bg-red-600" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="general"
            className="max-h-72 overflow-auto space-y-2 scrollbar dark:scrollbar--dark"
          >
            <General generalNotify={generalNotify} />
          </TabsContent>

          <TabsContent
            value="follow"
            className="max-h-72 overflow-auto space-y-2 scrollbar dark:scrollbar--dark"
          >
            <Follow followNotify={followNotify} />
          </TabsContent>

          <TabsContent
            value="system"
            className="max-h-72 overflow-auto space-y-2 scrollbar dark:scrollbar--dark"
          >
            <System systemNotify={systemNotify} />
          </TabsContent>
        </Tabs>
        <Button
          disabled={!hasNextPage}
          isLoading={isFetchingNextPage}
          onClick={() => {
            refetch();
            fetchNextPage();
          }}
          className="w-full"
          variant={'ghost'}
          size={'sm'}
        >
          Tải thêm
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
