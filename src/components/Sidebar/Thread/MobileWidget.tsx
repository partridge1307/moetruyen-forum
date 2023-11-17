'use client';

import { nFormatter } from '@/lib/utils';
import type { SubForum, Subscription, User } from '@prisma/client';
import { format } from 'date-fns';
import { Clock, Menu } from 'lucide-react';
import type { Session } from 'next-auth';
import { FC } from 'react';
import ForumImage from '../../ForumImage';
import { Sheet, SheetContent, SheetTrigger } from '../../ui/Sheet';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/Button';
import Search from './Search';

const SubscribeButton = dynamic(
  () => import('@/components/Action/SubscribeOrLeave'),
  { ssr: true }
);
const Members = dynamic(() => import('./Members'), { ssr: false });

interface ThreadWidgetProps {
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

const MobileWidget: FC<ThreadWidgetProps> = ({
  forum,
  session,
  isSubscribed,
  isOwner,
}) => {
  return (
    <section className="fixed top-0 inset-x-0 left-0 md:left-[240px] p-2 transition-transform">
      <div className="flex justify-between">
        <Link
          href={`/m/${forum.slug}`}
          className="line-clamp-1 text-2xl font-semibold"
        >
          {forum.title}
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <button aria-label="thread widget menu button">
              <Menu className="w-8 h-8" />
            </button>
          </SheetTrigger>
          <SheetContent
            side={'right'}
            className="p-2 z-[102] max-h-full overflow-auto"
          >
            <Search forumId={forum.id} />
            <ForumImage
              forum={forum}
              sizes="25vw"
              className="rounded-md object-cover"
            />
            <div className="mt-2 divide-y divide-primary text-sm">
              <Link
                href={`/m/${forum.slug}`}
                className="text-2xl font-semibold pb-1"
              >
                {forum.title}
              </Link>
              <div className="flex flex-wrap justify-between py-1.5 gap-x-4">
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
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
};

export default MobileWidget;
