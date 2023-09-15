import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';

const ThreadEditForm = dynamic(
  () => import('@/components/Create/Thread/Edit'),
  { ssr: false }
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
