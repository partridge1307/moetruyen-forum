import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';

const CreatePostForm = dynamic(() => import('@/components/Create/Post'), {
  ssr: false,
});

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
      OR: [
        {
          canSend: true,
          subscriptions: {
            some: {
              userId: session.user.id,
            },
          },
        },
        {
          creatorId: session.user.id,
        },
      ],
    },
    select: {
      id: true,
    },
  });
  if (!subForum) return notFound();

  return (
    <main className="p-3 rounded-md dark:bg-zinc-900/60">
      <CreatePostForm id={subForum.id} />
    </main>
  );
};

export default page;
