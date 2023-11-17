import ThreadCreateSkeleton from '@/components/Skeleton/ThreadCreateSkeleton';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import type { Metadata } from 'next';

const ThreadEditForm = dynamic(
  () => import('@/components/Create/Thread/Edit'),
  { ssr: false, loading: () => <ThreadCreateSkeleton /> }
);

interface pageProps {
  params: {
    slug: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();
  if (!session) return redirect('/');

  const subForum = await db.subForum.findUnique({
    where: {
      slug: params.slug,
      creatorId: session.user.id,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      banner: true,
      canSend: true,
      subscriptions: {
        where: {
          isManager: true,
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
  if (!subForum) return notFound();

  return (
    <div className="p-2 space-y-4 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-xl font-medium p-2">Sửa cộng đồng</h1>

      <hr className="dark:bg-zinc-700 rounded-full h-[2px]" />

      <ThreadEditForm subForum={subForum} />
    </div>
  );
};

export default page;

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  const subForum = await db.subForum.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      title: true,
      banner: true,
    },
  });

  if (!subForum)
    return {
      title: 'Sửa cộng đồng',
      description: 'Sửa cộng đồng | Moetruyen',
    };

  return {
    title: 'Sửa cộng đồng',
    description: `Sửa cộng đồng ${subForum.title} | Moetruyen`,
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/${params.slug}`,
    },
    keywords: ['Edit', 'Chỉnh sửa', 'Forum', 'Diễn đàn', `${subForum.title}`],
    openGraph: {
      ...(subForum.banner && {
        images: [{ url: subForum.banner, alt: `${subForum.title} Banner` }],
      }),
      url: `${process.env.NEXTAUTH_URL}/${params.slug}`,
      siteName: 'Moetruyen Forum',
      title: 'Sửa cộng đồng',
      description: `Sửa cộng đồng ${subForum.title} | Moetruyen`,
    },
    twitter: {
      ...(subForum.banner && {
        images: [{ url: subForum.banner, alt: `${subForum.title} Banner` }],
        card: 'summary_large_image',
      }),
      site: 'Moetruyen Forum',
      title: 'Sửa cộng đồng',
      description: `Sửa cộng đồng ${subForum.title} | Moetruyen`,
    },
  };
}
