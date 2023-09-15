'use client';

import { useVote } from '@/hooks/use-vote';
import { cn } from '@/lib/utils';
import { VoteType } from '@prisma/client';
import { Heart, HeartOff } from 'lucide-react';
import { FC } from 'react';
import { Button } from '../../ui/Button';

interface CommentVoteProps {
  commentId: number;
  callbackURL: string;
  voteAmt: number;
  currentVote?: VoteType | null;
}

const CommentVote: FC<CommentVoteProps> = ({
  commentId,
  callbackURL,
  voteAmt: initialVoteAmt,
  currentVote: initialVote,
}) => {
  const { Vote, voteAmt, currentVote } = useVote(
    commentId,
    callbackURL,
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
        className={cn('transition-colors hover:bg-transparent', {
          'text-red-500 hover:text-red-500': currentVote === 'UP_VOTE',
        })}
      >
        <Heart className="w-5 h-5" />
      </Button>

      <p>{voteAmt}</p>

      <Button
        onClick={() => Vote('DOWN_VOTE')}
        variant={'ghost'}
        size={'sm'}
        aria-label="dislike"
        className={cn('transition-colors hover:bg-transparent', {
          'text-red-500 hover:text-red-500': currentVote === 'DOWN_VOTE',
        })}
      >
        <HeartOff className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default CommentVote;
