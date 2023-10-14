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
const DeletePostServer = dynamic(() => import('@/components/DeletePostServer'));
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
      description: true,
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
    description:
      post.description.length === 1024
        ? `${post.description}...`
        : post.description,
    keywords: [
      'Post',
      'Bài viết',
      'Forum',
      'Diễn đàn',
      post.title,
      post.subForum.title,
      'Moetruyen',
    ],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/${params.slug}/${params.postId}`,
    },
    openGraph: {
      ...(post.subForum.banner && {
        images: [
          { url: post.subForum.banner, alt: `${post.subForum.title} Banner` },
        ],
      }),
      url: `${process.env.NEXTAUTH_URL}/${params.slug}/${params.postId}`,
      siteName: 'Moetruyen Forum',
      title: post.title,
      description:
        post.description.length === 1024
          ? `${post.description}...`
          : post.description,
    },
    twitter: {
      ...(post.subForum.banner && {
        images: [
          { url: post.subForum.banner, alt: `${post.subForum.title} Banner` },
        ],
        card: 'summary_large_image',
      }),
      site: 'Moetruyen Forum',
      title: post.title,
      description:
        post.description.length === 1024
          ? `${post.description}...`
          : post.description,
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
        authorId: true,
        subForumId: true,
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

  let isManager = false;
  if (session) {
    const subscriptions = await db.subscription.findUnique({
      where: {
        userId_subForumId: {
          userId: session.user.id,
          subForumId: post.subForumId,
        },
      },
      select: {
        isManager: true,
      },
    });

    if (subscriptions && subscriptions.isManager) isManager = true;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: `${process.env.NEXTAUTH_URL}/${params.slug}/${post.id}`,
    headline: post.title,
    description: `Bài viết ${post.title} | Moetruyen`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-16">
        <section className="p-2 rounded-md dark:bg-zinc-700">
          <article className="space-y-10">
            <div className="space-y-2">
              <div className="text-sm flex items-center gap-1">
                <a
                  href={`${
                    process.env.NEXT_PUBLIC_MAIN_URL
                  }/user/${post.author.name?.split(' ').join('-')}`}
                  target="_blank"
                >
                  <Username user={post.author} className="text-start" />
                </a>
                <span>•</span>
                <time dateTime={post.createdAt.toDateString()}>
                  {formatTimeToNow(new Date(post.createdAt))}
                </time>
              </div>

              <h1 className="text-3xl font-semibold">{post.title}</h1>
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
                url={`/${params.slug}/${post.id}`}
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

              {!!session && (
                <DeletePostServer
                  session={session}
                  subForumId={post.subForumId}
                  postId={post.id}
                  authorId={post.authorId}
                  slug={params.slug}
                />
              )}
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <h1 className="text-xl font-semibold">Bình luận</h1>
          <Comments id={post.id} session={session} isManager={isManager} />
        </section>
      </div>
    </>
  );
};

export default page;
