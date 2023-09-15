'use client';

import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { useSubComments } from '@/hooks/use-sub-comment';
import { formatTimeToNow } from '@/lib/utils';
import type {
  PostComment,
  PostVote as PostVoteType,
  User,
} from '@prisma/client';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import CommentContent from './components/CommentContent';
import CommentOEmbed from './components/CommentOEmbed';

const DeleteComment = dynamic(() => import('./components/DeleteComment'), {
  ssr: false,
});
const CommentVote = dynamic(() => import('./components/CommentVote'), {
  ssr: false,
});

type ExtendedSubComment = Pick<
  PostComment,
  'id' | 'content' | 'oEmbed' | 'creatorId' | 'createdAt'
> & {
  creator: Pick<User, 'image' | 'name' | 'color'>;
  votes: PostVoteType[];
};

interface SubCommentCardProps {
  commentId: number;
  userId?: string;
  callbackURL: string;
}

const SubCommentCard = ({
  commentId,
  userId,
  callbackURL,
}: SubCommentCardProps) => {
  const { data: subComment, isLoading: isFetchingSubComment } =
    useSubComments<ExtendedSubComment>(commentId, callbackURL);

  return isFetchingSubComment ? (
    <p>
      <Loader2 className="w-6 h-6 animate-spin" />
    </p>
  ) : (
    !!subComment?.length && (
      <ul className="mt-8 space-y-6">
        {subComment.map((comment) => {
          const voteAmt = comment.votes.reduce((acc, vote) => {
            if (vote.type === 'UP_VOTE') return acc + 1;
            if (vote.type === 'DOWN_VOTE') return acc - 1;
            return acc;
          }, 0);

          const currentVote = comment.votes.find(
            (vote) => vote.userId === userId
          )?.type;

          return (
            <li key={comment.id} className="flex gap-3 md:gap-6">
              <UserAvatar user={comment.creator} />

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

                  <div className="flex items-center gap-4">
                    <CommentVote
                      commentId={commentId}
                      callbackURL={callbackURL}
                      currentVote={currentVote}
                      voteAmt={voteAmt}
                    />

                    {userId === comment.creatorId && (
                      <DeleteComment
                        commentId={commentId}
                        callbackURL={callbackURL}
                      />
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    )
  );
};

export default SubCommentCard;
