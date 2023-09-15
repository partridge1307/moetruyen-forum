import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { formatTimeToNow } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import type { ExtendedComment } from '.';
import CommentContent from './components/CommentContent';
import CommentOEmbed from './components/CommentOEmbed';
import SubComment from './components/SubComment';
import CommentFuncSkeleton from '../Skeleton/CommentFuncSkeleton';

const CommentFunc = dynamic(() => import('./components/CommentFunc'), {
  ssr: false,
  loading: () => <CommentFuncSkeleton />,
});
const SubCommentCard = dynamic(() => import('./SubCommentCard'), {
  ssr: false,
});

interface CommentCardProps {
  comment: ExtendedComment;
  userId?: string;
  callbackURL: string;
}

const CommentCard = ({ comment, userId, callbackURL }: CommentCardProps) => {
  const voteAmt = comment.votes.reduce((acc, vote) => {
    if (vote.type === 'UP_VOTE') return acc + 1;
    if (vote.type === 'DOWN_VOTE') return acc - 1;
    return acc;
  }, 0);

  const currentVote = comment.votes.find(
    (vote) => vote.userId === userId
  )?.type;

  return (
    <>
      <UserAvatar user={comment.creator} className="mt-2 w-12 h-12" />

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Username user={comment.creator} />
          <p className="text-sm">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>

        <div className="space-y-2">
          <CommentContent id={comment.id} content={comment.content} />

          {!!comment.oEmbed && (
            <CommentOEmbed
              oEmbed={
                comment.oEmbed as {
                  link: string;
                  meta: {
                    title?: string;
                    description?: string;
                    image: {
                      url?: string;
                    };
                  };
                }
              }
            />
          )}

          {!!userId && (
            <CommentFunc
              commentId={comment.id}
              isAuthor={comment.creatorId === userId}
              voteAmt={voteAmt}
              currentVote={currentVote}
              callbackURL={callbackURL}
            />
          )}
        </div>

        {comment._count.replies !== 0 && (
          <SubComment subCommentLength={comment._count.replies}>
            <SubCommentCard
              commentId={comment.id}
              userId={userId}
              callbackURL={callbackURL}
            />
          </SubComment>
        )}
      </div>
    </>
  );
};

export default memo(CommentCard);
