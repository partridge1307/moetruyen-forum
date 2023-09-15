import CommentSkeleton from '@/components/Skeleton/CommentsSkeleton';
import PostVoteSkeleton from '@/components/Skeleton/PostVoteSkeleton';
import Username from '@/components/User/Username';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn, formatTimeToNow } from '@/lib/utils';
import { Loader2, Pencil } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const MTEditorOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  {
    ssr: false,
    loading: () => (
      <span className="flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin" />
      </span>
    ),
  }
);
const PostVoteServer = dynamic(
  () => import('@/components/Vote/PostVoteServer'),
  { loading: () => <PostVoteSkeleton /> }
);
const PostShareButton = dynamic(() => import('@/components/PostShareButton'), {
  ssr: false,
  loading: () => (
    <div className="w-28 h-10 rounded-md animate-pulse dark:bg-zinc-900" />
  ),
});
const Comments = dynamic(() => import('@/components/Comment'), {
  ssr: false,
  loading: () => <CommentSkeleton />,
});

interface pageProps {
  params: {
    slug: string;
    postId: string;
  };
}

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  const post = await db.post.findUnique({
    where: {
      id: +params.postId,
    },
    select: {
      title: true,
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
      title: 'Bài viết',
      description: 'Bài viết | Moetruyen',
    };

  return {
    title: {
      default: post.title,
      absolute: post.title,
    },
    description: `Bài viết ${post.title} - ${post.subForum.title} | Moetruyen`,
    keywords: ['Post', 'Forum', post.title, post.subForum.title, 'Moetruyen'],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/${params.slug}/${params.postId}`,
    },
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/${params.slug}/${params.postId}`,
      siteName: 'Moetruyen Forum',
      title: post.title,
      description: `Bài viết ${post.title} - ${post.subForum.title} | Moetruyen`,
      images: [
        {
          url: post.subForum.banner ?? '',
          alt: `Ảnh bìa ${post.subForum.title}`,
        },
      ],
    },
    twitter: {
      site: 'Moetruyen Forum',
      title: post.title,
      description: `Bài viết ${post.title} - ${post.subForum.title} | Moetruyen`,
      card: 'summary_large_image',
      images: [
        {
          url: post.subForum.banner ?? '',
          alt: `Ảnh bìa ${post.subForum.title}`,
        },
      ],
    },
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const [post, session] = await Promise.all([
    db.post.findUnique({
      where: {
        id: +params.postId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    }),
    getAuthSession(),
  ]);
  if (!post) return notFound();

  return (
    <div className="space-y-16">
      <section className="p-2 rounded-md dark:bg-zinc-700">
        <article className="space-y-10">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">{post.title}</h1>
            <h2 className="flex items-center gap-2 text-sm">
              <span>Đăng bởi</span>
              <a href={`/user/${post.author.name?.split(' ').join('-')}`}>
                <Username user={post.author} />
              </a>
            </h2>
            <dl className="flex flex-col lg:flex-row lg:items-center lg:divide-x-2 lg:dark:divide-zinc-500">
              <dt className="text-sm lg:pr-1">
                Tạo:{' '}
                <time dateTime={post.createdAt.toDateString()}>
                  {formatTimeToNow(new Date(post.createdAt))}
                </time>
              </dt>
              <dd className="text-sm lg:pl-1">
                Cập nhật:{' '}
                <time dateTime={post.updatedAt.toDateString()}>
                  {formatTimeToNow(new Date(post.updatedAt))}
                </time>
              </dd>
            </dl>
          </div>

          <MTEditorOutput id={post.id} content={post.content} />
        </article>

        <div className="flex flex-wrap justify-between gap-6">
          <PostVoteServer
            session={session}
            getData={() =>
              db.post.findUnique({
                where: {
                  id: +params.postId,
                },
                select: {
                  id: true,
                  votes: true,
                },
              })
            }
          />

          <div className="flex items-center gap-4">
            <PostShareButton
              url={`/m/${params.slug}/${post.id}`}
              title={post.title}
            />

            {!!(post.authorId === session?.user.id) && (
              <Link
                href={`/${params.slug}/edit/${post.id}`}
                className={cn(buttonVariants({ size: 'sm' }), 'gap-2')}
              >
                <Pencil className="w-5 h-5" /> Chỉnh sửa
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <h1 className="text-xl font-semibold">Bình luận</h1>

        <Comments postId={post.id} />
      </section>
    </div>
  );
};

export default page;
