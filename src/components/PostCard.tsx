'use client';

import type { ExtendedPost } from '@/components/Feed/PostFeed';
import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import PostVoteClient from '@/components/Vote/PostVoteClient';
import { formatTimeToNow } from '@/lib/utils';
import { useElementSize } from '@mantine/hooks';
import type { VoteType } from '@prisma/client';
import { MessageSquare } from 'lucide-react';
import dynamic from 'next/dist/shared/lib/dynamic';
import { FC } from 'react';

const MoetruyenEditorOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  {
    ssr: false,
  }
);
const PostShareButton = dynamic(() => import('@/components/PostShareButton'), {
  ssr: false,
});

interface PostCardProps {
  subForumSlug: string;
  post: ExtendedPost;
  voteAmt: number;
  currentVote?: VoteType;
}

const PostCard: FC<PostCardProps> = ({
  subForumSlug,
  post,
  voteAmt,
  currentVote,
}) => {
  const { ref, height } = useElementSize();

  return (
    <div className="p-2 rounded-md transition-colors hover:dark:bg-zinc-900">
      <a
        target="_blank"
        href={`/${subForumSlug}/${post.id}`}
        className="block space-y-2"
      >
        <div className="text-sm">
          <p className="pl-1">m/{post.subForum.title}</p>
          <div className="flex items-center gap-2">
            <UserAvatar user={post.author} className="w-5 h-5" />
            <Username user={post.author} />
            <span>{formatTimeToNow(new Date(post.createdAt))}</span>
          </div>
        </div>

        <h1 className="text-xl font-semibold">{post.title}</h1>
        <div
          ref={ref}
          className="relative overflow-hidden"
          style={{ maxHeight: '18rem' }}
        >
          <MoetruyenEditorOutput id={post.id} content={post.content} />
          {height === 288 && (
            <div className="absolute bottom-0 inset-0 bg-gradient-to-t dark:from-zinc-900" />
          )}
        </div>
      </a>

      <div className="flex flex-wrap items-center gap-3 lg:gap-6 pt-3">
        <PostVoteClient
          postId={post.id}
          voteAmt={voteAmt}
          currentVote={currentVote}
        />
        <a
          target="_blank"
          href={`/${subForumSlug}/${post.id}`}
          className="flex items-end gap-2"
        >
          <MessageSquare className="w-5 h-5" /> {post._count.comments}
        </a>
        <PostShareButton
          url={`/${subForumSlug}/${post.id}`}
          title={post.title}
        />
      </div>
    </div>
  );
};

export default PostCard;
