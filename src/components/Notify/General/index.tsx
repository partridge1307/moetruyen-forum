import { serverDomain } from '@/config';
import { cn, formatTimeToNow } from '@/lib/utils';
import { FC } from 'react';
import type { ExtendedNotify } from '..';

interface generalProps {
  generalNotify: ExtendedNotify[];
}

const General: FC<generalProps> = ({ generalNotify }) => {
  return !!generalNotify.length ? (
    generalNotify.map((notify) => {
      if (notify.type === 'COMMENT')
        return (
          <a
            key={notify.id}
            target="_blank"
            href={notify.endPoint}
            className="block"
            onClick={() =>
              fetch(`/api/notify/${notify.id}`, { method: 'PATCH' })
            }
          >
            <div
              className={cn('p-1 rounded-md', {
                'transition-colors dark:bg-zinc-900 hover:dark:bg-zinc-900/60':
                  !notify.isRead,
              })}
            >
              <p>{notify.content}</p>
              <time dateTime={new Date(notify.createdAt).toDateString()}>
                <span className="text-xs">
                  {formatTimeToNow(new Date(notify.createdAt))}
                </span>
              </time>
            </div>
          </a>
        );
      else
        return (
          <a
            key={notify.id}
            target="_blank"
            href={`${serverDomain}${notify.endPoint}`}
            className="block"
            onClick={() =>
              fetch(`/api/notify/${notify.id}`, { method: 'PATCH' })
            }
          >
            <div
              className={cn('p-1 rounded-md', {
                'transition-colors dark:bg-zinc-900 hover:dark:bg-zinc-900/60':
                  !notify.isRead,
              })}
            >
              <p>{notify.content}</p>
              <time dateTime={new Date(notify.createdAt).toDateString()}>
                <span className="text-xs">
                  {formatTimeToNow(new Date(notify.createdAt))}
                </span>
              </time>
            </div>
          </a>
        );
    })
  ) : (
    <p>Không có thông báo</p>
  );
};

export default General;
