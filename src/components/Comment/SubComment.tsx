'use client';

import CommentVoteSkeleton from '@/components/Skeleton/CommentVoteSkeleton';
import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { useSubComments } from '@/hooks/use-sub-comment';
import { cn, formatTimeToNow } from '@/lib/utils';
import type { PostComment, PostCommentVote, User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { FC, useEffect, useState } from 'react';
import CommentContent from './components/CommentContent';
import type { CommentInputProps } from './components/CommentInput';
import CommentOEmbed from './components/CommentOEmbed';
import type { DeleteCommentProps } from './components/DeleteComment';

const CommentVote = dynamic(() => import('./components/CommentVote'), {
  ssr: false,
  loading: () => <CommentVoteSkeleton />,
});
const DeleteComment = dynamic<DeleteCommentProps<ExtendedSubComment>>(
  () => import('./components/DeleteComment'),
  { ssr: false }
);
const CommentInput = dynamic<CommentInputProps<ExtendedSubComment>>(
  () => import('./components/CommentInput'),
  { ssr: false }
);

export type ExtendedSubComment = Pick<
  PostComment,
  'id' | 'content' | 'oEmbed' | 'creatorId' | 'createdAt'
> & {
  creator: Pick<User, 'name' | 'image' | 'color'>;
  votes: PostCommentVote[];
  isSending?: boolean;
};

interface SubCommentProps {
  commentId: number;
  session: Session | null;
}

const SubComment: FC<SubCommentProps> = ({ commentId, session }) => {
  const { serverErrorToast } = useCustomToast();
  const {
    data: subCommentsData,
    error,
    isFetching,
  } = useSubComments<ExtendedSubComment>(commentId);
  const [subComments, setSubComments] = useState<ExtendedSubComment[]>([]);

  useEffect(() => {
    if (error) {
      serverErrorToast();
    }
  }, [error, serverErrorToast]);

  useEffect(() => {
    if (subCommentsData?.length) {
      setSubComments(subCommentsData);
    }
  }, [subCommentsData]);

  return isFetching ? (
    <Loader2
      aria-label="loading sub comment"
      className="w-10 h-10 animate-spin"
    />
  ) : (
    <>
      <ul className="space-y-6 mb-10">
        {!!subComments.length &&
          subComments.map((subComment) => (
            <li
              key={subComment.id}
              className={cn('flex gap-4', {
                'opacity-70': subComment.isSending,
              })}
            >
              <UserAvatar user={subComment.creator} />

              <div className="space-y-1">
                <dl className="flex flex-wrap items-center gap-2">
                  <dt>
                    <Username user={subComment.creator} />
                  </dt>
                  <dd className="text-sm">
                    <time
                      dateTime={new Date(subComment.createdAt).toDateString()}
                    >
                      {formatTimeToNow(new Date(subComment.createdAt))}
                    </time>
                  </dd>
                </dl>

                <div className="space-y-2">
                  <CommentContent
                    commentId={subComment.id}
                    commentContent={subComment.content}
                  />

                  {!!subComment.oEmbed && (
                    <CommentOEmbed oEmbed={subComment.oEmbed} />
                  )}

                  <div className="flex items-center gap-4">
                    {!!session && (
                      <CommentVote
                        isSending={subComment.isSending}
                        commentId={subComment.id}
                        votes={subComment.votes}
                        sessionUserId={session.user.id}
                        APIQuery="/api/comment"
                      />
                    )}

                    {session?.user.id === subComment.creatorId && (
                      <DeleteComment
                        isSending={subComment.isSending}
                        commentId={subComment.id}
                        APIQuery={`/api/comment/${subComment.id}`}
                        setComments={setSubComments}
                      />
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
      </ul>

      {!!session && (
        <CommentInput
          type="SUB_COMMENT"
          session={session}
          id={commentId}
          setComments={setSubComments}
          APIQuery="/api/comment"
        />
      )}
    </>
  );
};

export default SubComment;
