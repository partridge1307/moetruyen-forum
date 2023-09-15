import Username from '@/components/User/Username';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';

const DeleteThreadButton = dynamic(
  () => import('@/components/DeleteThreadButton'),
  { ssr: false }
);
const SubscribeOrLeave = dynamic(
  () => import('@/components/SubscribeOrLeave'),
  { ssr: false }
);

interface layoutProps {
  params: { slug: string };
  children: React.ReactNode;
}

const layout: FC<layoutProps> = async ({ params, children }) => {
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
    <main className="container max-sm:px-2 grid grid-cols-1 lg:grid-cols-[1fr_.45fr] gap-6 mb-10">
      <section className="flex flex-col gap-y-6">{children}</section>

      <section className="order-first lg:order-last h-fit rounded-md dark:bg-zinc-900">
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
              <Username user={subForum.creator} />
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
      </section>
    </main>
  );
};

export default layout;
