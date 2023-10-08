'use client';

import { useNotify } from '@/hooks/use-notify';
import type { Notify } from '@prisma/client';
import { Bell, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs';
import GeneralNoti from './General';

const SystemNoti = dynamic(() => import('./System'), { ssr: false });
const FollowNoti = dynamic(() => import('./Follow'), { ssr: false });
const NotifyControll = dynamic(() => import('./NotifyControll'), {
  ssr: false,
});

export type ExtendedNotify = Pick<
  Notify,
  'id' | 'type' | 'createdAt' | 'content' | 'endPoint' | 'isRead'
>;

const Notifications = () => {
  const {
    notifies,
    setNotifies,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useNotify<ExtendedNotify>();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Notify button" className="relative">
          <Bell aria-label="Notify button" className="w-7 h-7" />

          {notifies.some((noti) => !noti.isRead) && (
            <span className="absolute w-2 h-2 rounded-full top-0 right-0 animate-ping dark:bg-red-500" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        avoidCollisions
        className="space-y-1.5 dark:bg-zinc-900"
      >
        <DropdownMenuLabel className="text-base">Thông báo</DropdownMenuLabel>

        {!!notifies.length && <NotifyControll setNotifies={setNotifies} />}

        <Tabs defaultValue="GENERAL" className="relative w-72 md:w-96">
          <TabsList className="w-full justify-between gap-2">
            <TabsTrigger
              value="GENERAL"
              className="space-x-2 duration-500 data-[state=active]:flex-1 data-[state=inactive]:px-4"
            >
              <span>Chung</span>

              {notifies.some(
                (noti) => noti.type === 'GENERAL' && !noti.isRead
              ) && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="FOLLOW"
              className="space-x-2 duration-500 data-[state=active]:flex-1 data-[state=inactive]:px-4"
            >
              <span>Theo dõi</span>

              {notifies.some(
                (noti) => noti.type === 'FOLLOW' && !noti.isRead
              ) && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="SYSTEM"
              className="space-x-2 duration-500 data-[state=active]:flex-1 data-[state=inactive]:px-4"
            >
              <span>Hệ thống</span>

              {notifies.some(
                (noti) => noti.type === 'SYSTEM' && !noti.isRead
              ) && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              )}
            </TabsTrigger>
          </TabsList>

          <GeneralNoti
            notifies={notifies.filter((noti) => noti.type === 'GENERAL')}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
          />

          <FollowNoti
            notifies={notifies.filter((noti) => noti.type === 'FOLLOW')}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
          />

          <SystemNoti
            notifies={notifies.filter((noti) => noti.type === 'SYSTEM')}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
          />
        </Tabs>

        {isFetchingNextPage && (
          <p className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
