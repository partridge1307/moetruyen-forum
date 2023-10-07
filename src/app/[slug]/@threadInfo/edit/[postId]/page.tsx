import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const DeleteThreadButton = dynamic(
  () => import('@/components/DeleteThreadButton'),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
    ),
  }
);
const SubscribeOrLeave = dynamic(
  () => import('@/components/SubscribeOrLeave'),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
    ),
  }
);

interface PageProps {
  params: {
    slug: string;
  };
}

const Page: FC<PageProps> = async ({ params }) => {
  const session = await getAuthSession();

  const [subForum, subscription] = await db.$transaction([
    db.subForum.findUnique({
      where: {
        slug: params.slug,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        banner: true,
        createdAt: true,
        creatorId: true,
        creator: {
          select: {
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
        subscriptions: {
          select: {
            isManager: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                color: true,
              },
            },
          },
        },
      },
    }),
    db.subscription.findFirst({
      where: {
        subForum: {
          slug: params.slug,
        },
        userId: session?.user.id,
      },
    }),
  ]);
  if (!subForum) return notFound();

  return (
    <section className="order-first lg:order-last h-fit">
      {!!subForum.banner && (
        <div className="relative aspect-video">
          <Image
            priority
            fill
            sizes="(max-width: 648px) 50vw, 40vw"
            quality={40}
            src={subForum.banner}
            alt={`${subForum.title} Banner`}
            className="rounded-t-md object-top object-cover"
          />
        </div>
      )}

      <div className="rounded-md dark:bg-zinc-900">
        <h1
          className={cn('text-lg font-medium p-3 dark:bg-zinc-700', {
            'rounded-t-md': !!!subForum.banner,
          })}
        >
          m/{subForum.title}
        </h1>

        <div className="p-3 divide-y dark:divide-zinc-700">
          <dl className="flex justify-between py-4">
            <dt>Tạo từ</dt>
            <dd>
              <time dateTime={subForum.createdAt.toDateString()}>
                {format(new Date(subForum.createdAt), 'd/M/yyyy')}
              </time>
            </dd>
          </dl>

          <dl className="flex justify-between py-4">
            <dt>Member</dt>
            <dd>{subForum._count.subscriptions}</dd>
          </dl>

          <dl className="flex justify-between py-4">
            <dt>Tạo bởi</dt>
            <dd>
              <Username user={subForum.creator} className="line-clamp-2" />
            </dd>
          </dl>

          {subForum.creatorId === session?.user.id && (
            <>
              <Link
                href={`/${subForum.slug}/edit`}
                className={cn(buttonVariants(), 'w-full mb-4')}
              >
                Chỉnh sửa
              </Link>
              <DeleteThreadButton subForumId={subForum.id} />
            </>
          )}

          {!!session && subForum.creatorId !== session.user.id && (
            <SubscribeOrLeave
              subForumId={subForum.id}
              isSubscribed={!!subscription}
            />
          )}
        </div>

        {!!subForum.subscriptions.length && (
          <div className="p-2 pt-4 space-y-2">
            <h1 className="text-lg font-semibold">Member</h1>
            <ul className="space-y-2 max-h-36 lg:max-h-72 overflow-auto scrollbar dark:scrollbar--dark">
              {subForum.subscriptions.map((sub) => (
                <li key={sub.user.id} className="flex items-center gap-4">
                  <UserAvatar user={sub.user} />
                  <Username user={sub.user} className="line-clamp-1" />
                  {sub.isManager && (
                    <span className="text-sm p-1 rounded-md dark:bg-zinc-800/80">
                      MOD
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default Page;
