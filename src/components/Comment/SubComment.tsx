'use client';

import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { useSubComments } from '@/hooks/use-sub-comment';
import { formatTimeToNow } from '@/lib/utils';
import { usePrevious } from '@mantine/hooks';
import type { PostComment, PostVote, User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { FC, useEffect, useState } from 'react';
import CommentVoteSkeleton from '../Skeleton/CommentVoteSkeleton';
import CommentContent from './components/CommentContent';
import CommentOEmbed from './components/CommentOEmbed';

const CommentVote = dynamic(() => import('./components/CommentVote'), {
  ssr: false,
  loading: () => <CommentVoteSkeleton />,
});
const CommentInput = dynamic(() => import('./components/CommentInput'), {
  ssr: false,
});
const DeleteComment = dynamic(() => import('./components/DeleteComment'), {
  ssr: false,
});

export type ExtendedSubComment = Pick<
  PostComment,
  'id' | 'content' | 'oEmbed' | 'creatorId' | 'createdAt'
> & {
  creator: Pick<User, 'name' | 'image' | 'color'>;
  votes: PostVote[];
};

interface SubCommentProps {
  commentId: number;
  session: Session | null;
  isManager: boolean;
}

const SubComment: FC<SubCommentProps> = ({ commentId, session, isManager }) => {
  const { data: subCommentsData, isFetching } =
    useSubComments<ExtendedSubComment>(commentId, `/api/comment/${commentId}`);
  const [subComments, setSubComments] = useState<ExtendedSubComment[]>([]);
  const prevComments = usePrevious(subComments);

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
            <li key={subComment.id} className="flex gap-4">
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
                    id={subComment.id}
                    content={subComment.content}
                  />

                  {!!subComment.oEmbed && (
                    <CommentOEmbed oEmbed={subComment.oEmbed} />
                  )}

                  <div className="flex items-center gap-4">
                    {!!session && (
                      <CommentVote
                        commentId={subComment.id}
                        votes={subComment.votes}
                        sessionUserId={session.user.id}
                      />
                    )}

                    {(session?.user.id === subComment.creatorId ||
                      isManager) && (
                      <DeleteComment
                        type="SUB_COMMENT"
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
          postId={commentId}
          setComments={setSubComments}
          prevComment={prevComments}
        />
      )}
    </>
  );
};

export default SubComment;
