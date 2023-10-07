'use client';

import { TabsContent } from '@/components/ui/Tabs';
import { formatTimeToNow } from '@/lib/utils';
import { useIntersection } from '@mantine/hooks';
import { FC, useEffect, useRef } from 'react';
import { ExtendedNotify } from '..';

interface SystemNotiProps {
  notifies: ExtendedNotify[];
  hasNextPage?: boolean;
  fetchNextPage: () => void;
}

const SystemNoti: FC<SystemNotiProps> = ({
  notifies,
  hasNextPage,
  fetchNextPage,
}) => {
  const notiRef = useRef(null);
  const { ref, entry } = useIntersection({
    root: notiRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, fetchNextPage, hasNextPage]);

  return (
    <TabsContent
      value="SYSTEM"
      className="space-y-2 max-h-72 overflow-auto pr-1.5 scrollbar dark:scrollbar--dark"
    >
      {!!notifies.length ? (
        notifies.map((noti, idx) => {
          if (idx === notifies.length - 1)
            return (
              <a
                ref={ref}
                key={noti.id}
                href={noti.endPoint}
                className={`flex items-start gap-3 p-2 rounded-md transition-colors${
                  !noti.isRead
                    ? ' dark:bg-zinc-800 hover:dark:bg-zinc-800/80'
                    : ''
                }`}
                onClick={() =>
                  fetch('/api/notify', {
                    method: 'PATCH',
                    body: JSON.stringify({ id: noti.id }),
                  })
                }
              >
                <time
                  dateTime={new Date(noti.createdAt).toDateString()}
                  className="shrink-0 text-sm leading-6"
                >
                  {formatTimeToNow(new Date(noti.createdAt))}
                </time>

                <p>{noti.content}</p>
              </a>
            );
          else
            return (
              <a
                key={noti.id}
                href={noti.endPoint}
                className={`flex items-start gap-3 p-2 rounded-md transition-colors${
                  !noti.isRead
                    ? ' dark:bg-zinc-800 hover:dark:bg-zinc-800/80'
                    : ''
                }`}
                onClick={() =>
                  fetch('/api/notify', {
                    method: 'PATCH',
                    body: JSON.stringify({ id: noti.id }),
                  })
                }
              >
                <time
                  dateTime={new Date(noti.createdAt).toDateString()}
                  className="shrink-0 text-sm leading-6"
                >
                  {formatTimeToNow(new Date(noti.createdAt))}
                </time>

                <p>{noti.content}</p>
              </a>
            );
        })
      ) : (
        <p className="p-2">Bạn chưa có thông báo nào</p>
      )}
    </TabsContent>
  );
};

export default SystemNoti;
