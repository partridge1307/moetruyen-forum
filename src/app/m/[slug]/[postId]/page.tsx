import Author from '@/components/Feed/Author';
import Vote from '@/components/Feed/Vote';
import ShareButton from '@/components/PostShareButton';
import CommentSkeleton from '@/components/Skeleton/CommentsSkeleton';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Loader2, Pen } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const MTOutput = dynamic(
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

const DeletePost = dynamic(
  () => import('@/components/Action/DeletePostServer')
);

const Comments = dynamic(() => import('@/components/Comment'), {
  ssr: true,
  loading: () => <CommentSkeleton />,
});

interface pageProps {
  params: {
    slug: string;
    postId: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const [post, session] = await Promise.all([
    await db.post.findUnique({
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
        subForum: {
          select: {
            slug: true,
            title: true,
          },
        },
        votes: true,
        author: {
          select: {
            image: true,
            name: true,
            color: true,
          },
        },
      },
    }),
    getAuthSession(),
  ]);
  if (!post) return notFound();

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

      <div className="rounded-lg p-3 bg-muted">
        <Author post={post} />
        <div className="my-3 space-y-3">
          <p className="text-3xl font-semibold">{post.title}</p>

          <MTOutput id={post.id} content={post.content} />
        </div>

        <div className="py-3 flex items-center justify-between border-t-2 border-primary">
          <Vote post={post} session={session} />
          <div className="flex items-center gap-2">
            <ShareButton
              title={post.title}
              url={`/m/${post.subForum.slug}/${post.id}`}
            />

            {!!session && <DeletePost session={session} post={post} />}

            {!!session && session.user.id === post.authorId && (
              <Link
                href={`/m/${post.subForum.slug}/edit/${post.id}`}
                className={buttonVariants({
                  variant: 'ghost',
                  className: 'gap-1.5',
                })}
              >
                <Pen />
                Chỉnh sửa
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xl font-semibold">Bình luận</p>
        <Comments id={post.id} session={session} />
      </div>
    </>
  );
};

export default page;

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  const post = await db.post.findUnique({
    where: {
      id: +params.postId,
    },
    select: {
      title: true,
      plainTextContent: true,
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

  const description =
    post.plainTextContent.length >= 1024
      ? `${post.plainTextContent.substring(0, 1024)}...`
      : post.plainTextContent;

  return {
    title: {
      default: post.title,
      absolute: post.title,
    },
    description,
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
      description,
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
      description,
    },
  };
}
