'use client';

import ForumImage from '@/components/ForumImage';
import { buttonVariants } from '@/components/ui/Button';
import { nFormatter } from '@/lib/utils';
import { useMediaQuery } from '@mantine/hooks';
import type { SubForum, Subscription, User } from '@prisma/client';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FC } from 'react';
import MobileWidget from './MobileWidget';
import Search from './Search';

const SubscribeButton = dynamic(
  () => import('@/components/Action/SubscribeOrLeave'),
  {
    ssr: true,
    loading: () => (
      <div className="w-full h-10 rounded-md animate-pulse bg-primary-foreground" />
    ),
  }
);
const Members = dynamic(() => import('./Members'), {
  ssr: false,
  loading: () => <div className="w-full h-10 bg-primary-foreground" />,
});

interface WidgetProps {
  forum: Pick<SubForum, 'id' | 'slug' | 'banner' | 'title' | 'createdAt'> & {
    creator: Pick<User, 'name'>;
    subscriptions: (Pick<Subscription, 'isManager'> & {
      user: Pick<User, 'name' | 'color' | 'image'>;
    })[];
  };
  session: Session | null;
  isSubscribed: boolean;
  isOwner: boolean;
}

const Widget: FC<WidgetProps> = ({ forum, session, isSubscribed, isOwner }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return isDesktop ? (
    <section className="relative flex-1 p-2 max-h-full overflow-auto border-l-2 border-l-primary hide_scrollbar">
      <Search forumId={forum.id} />
      <ForumImage forum={forum} className="rounded-md object-cover" />
      <div className="mt-2 divide-y divide-primary">
        <Link
          href={`/m/${forum.slug}`}
          className="text-3xl font-semibold py-1.5"
        >
          {forum.title}
        </Link>

        <div className="flex items-center justify-between py-2">
          <dl className="flex items-center gap-1.5">
            <dt>{format(forum.createdAt, 'd/L/y')}</dt>
            <dd>
              <Clock className="w-4 h-4" />
            </dd>
          </dl>
          <dl className="flex items-center gap-1.5">
            <dt>{nFormatter(forum.subscriptions.length, 1)}</dt>
            <dd>Thành viên</dd>
          </dl>
        </div>

        <dl className="py-2 flex justify-between">
          <dt>Người tạo</dt>
          <dd>{forum.creator.name}</dd>
        </dl>

        {!!session && (
          <div className="py-2">
            {!isOwner && (
              <SubscribeButton
                subForumId={forum.id}
                isSubscribed={isSubscribed}
              />
            )}
            {isOwner && (
              <Link
                href={`/m/${forum.slug}/edit`}
                className={buttonVariants({ className: 'w-full' })}
              >
                Chỉnh sửa
              </Link>
            )}
          </div>
        )}

        {!!forum.subscriptions.length && (
          <Members subscription={forum.subscriptions} />
        )}
      </div>
    </section>
  ) : (
    <MobileWidget
      forum={forum}
      session={session}
      isSubscribed={isSubscribed}
      isOwner={isOwner}
    />
  );
};

export default Widget;
