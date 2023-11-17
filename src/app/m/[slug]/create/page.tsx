import PostCreateSkeleton from '@/components/Skeleton/PostCreateSkeleton';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import type { Metadata } from 'next';

const CreatePostForm = dynamic(() => import('@/components/Create/Post'), {
  ssr: false,
  loading: () => <PostCreateSkeleton />,
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

  return <CreatePostForm id={subForum.id} />;
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
      title: 'Đăng bài',
      description: 'Đăng bài | Moetruyen',
    };

  return {
    title: 'Đăng bài',
    description: `Đăng bài tại cộng đồng ${subForum.title} | Moetruyen`,
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/${params.slug}`,
    },
    keywords: [
      'Create Post',
      'Đăng bài',
      'Forum',
      'Diễn đàn',
      `${subForum.title}`,
    ],
    openGraph: {
      ...(subForum.banner && {
        images: [{ url: subForum.banner, alt: `${subForum.title} Banner` }],
      }),
      url: `${process.env.NEXTAUTH_URL}/${params.slug}`,
      siteName: 'Moetruyen Forum',
      title: 'Đăng bài',
      description: `Đăng bài tại cộng đồng ${subForum.title} | Moetruyen`,
    },
    twitter: {
      ...(subForum.banner && {
        images: [{ url: subForum.banner, alt: `${subForum.title} Banner` }],
        card: 'summary_large_image',
      }),
      site: 'Moetruyen Forum',
      title: 'Đăng bài',
      description: `Đăng bài tại cộng đồng ${subForum.title} | Moetruyen`,
    },
  };
}
