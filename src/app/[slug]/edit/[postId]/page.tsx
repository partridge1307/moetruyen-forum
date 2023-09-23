import PostCreateSkeleton from '@/components/Skeleton/PostCreateSkeleton';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  const post = await db.post.findUnique({
    where: {
      id: +params.postId,
    },
    select: {
      subForum: {
        select: {
          title: true,
          banner: true,
        },
      },
    },
  });

  if (!post)
    return {
      title: 'Sửa bài viết',
      description: 'Sửa bài viết | Moetruyen',
    };

  return {
    title: 'Sửa bài viết',
    description: `Sửa bài viết cộng đồng ${post.subForum.title} | Moetruyen`,
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/${params.slug}/${params.postId}`,
    },
    keywords: [
      'Edit',
      'Chỉnh sửa',
      'Post',
      'Bài viết',
      'Forum',
      'Diễn đàn',
      `${post.subForum.title}`,
    ],
    openGraph: {
      ...(post.subForum.banner && {
        images: [
          { url: post.subForum.banner, alt: `${post.subForum.title} Banner` },
        ],
      }),
      url: `${process.env.NEXTAUTH_URL}/${params.slug}`,
      siteName: 'Moetruyen Forum',
      title: 'Sửa bài viết',
      description: `Sửa bài viết cộng đồng ${post.subForum.title} | Moetruyen`,
    },
    twitter: {
      ...(post.subForum.banner && {
        images: [
          { url: post.subForum.banner, alt: `${post.subForum.title} Banner` },
        ],
        card: 'summary_large_image',
      }),
      site: 'Moetruyen Forum',
      title: 'Sửa bài viết',
      description: `Sửa bài viết cộng đồng ${post.subForum.title} | Moetruyen`,
    },
  };
}

const PostEdit = dynamic(() => import('@/components/Create/Post/Edit'), {
  ssr: false,
  loading: () => <PostCreateSkeleton />,
});

interface pageProps {
  params: {
    slug: string;
    postId: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();
  if (!session) return redirect('/');

  const post = await db.post.findUnique({
    where: {
      id: +params.postId,
      authorId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      content: true,
      description: true,
      subForum: {
        select: {
          slug: true,
        },
      },
    },
  });
  if (!post) return notFound();

  return (
    <div className="p-3 rounded-md dark:bg-zinc-900/60">
      <PostEdit post={post} />
    </div>
  );
};

export default page;
