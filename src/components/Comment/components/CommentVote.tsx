'use client';

import { Button } from '@/components/ui/Button';
import { useVote } from '@/hooks/use-vote';
import { cn } from '@/lib/utils';
import type { PostVote } from '@prisma/client';
import { Heart, HeartOff } from 'lucide-react';
import { FC } from 'react';

interface CommentVoteProps {
  commentId: number;
  votes: PostVote[];
  sessionUserId?: string;
}

const CommentVote: FC<CommentVoteProps> = ({
  commentId,
  votes,
  sessionUserId,
}) => {
  const initialVoteAmt = votes.reduce((acc, vote) => {
    if (vote.type === 'UP_VOTE') return acc + 1;
    if (vote.type === 'DOWN_VOTE') return acc - 1;
    return acc;
  }, 0);
  const initialVote = votes.find((vote) => vote.userId === sessionUserId)?.type;

  const { Vote, voteAmt, currentVote } = useVote(
    commentId,
    `/api/comment`,
    initialVoteAmt,
    initialVote
  );

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={() => Vote('UP_VOTE')}
        variant={'ghost'}
        size={'sm'}
        aria-label="like"
        className={cn('transition-colors', {
          'text-red-500 hover:text-red-500/80': currentVote === 'UP_VOTE',
        })}
      >
        <Heart className="w-5 h-5" />
      </Button>

      <span>{voteAmt}</span>

      <Button
        onClick={() => Vote('DOWN_VOTE')}
        variant={'ghost'}
        size={'sm'}
        aria-label="dislike"
        className={cn('transition-colors', {
          'text-red-500 hover:text-red-500/80': currentVote === 'DOWN_VOTE',
        })}
      >
        <HeartOff className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default CommentVote;
