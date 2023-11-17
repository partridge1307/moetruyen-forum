'use client';

import { useVote } from '@/hooks/use-vote';
import { cn } from '@/lib/utils';
import type { Post, PostVote } from '@prisma/client';
import { Heart, HeartOff } from 'lucide-react';
import type { Session } from 'next-auth';
import { FC, memo } from 'react';
import { Button } from '../ui/Button';

interface VoteProps extends React.HTMLAttributes<HTMLDivElement> {
  post: Pick<Post, 'id'> & {
    votes: PostVote[];
  };
  session: Session | null;
}

const Vote: FC<VoteProps> = ({ post, session, className, ...props }) => {
  const { Vote, voteAmt, currentVote } = useVote(
    post.id,
    post.votes.reduce((vote, currentVote) => {
      if (currentVote.type === 'UP_VOTE') ++vote;
      else if (currentVote.type === 'DOWN_VOTE') --vote;

      return vote;
    }, 0),
    'POST',
    post.votes.find((vote) => vote.userId === session?.user.id)?.type ?? null
  );

  return (
    <div className={cn('flex items-center gap-1.5', className)} {...props}>
      <Button
        onClick={() => Vote('UP_VOTE')}
        variant={'ghost'}
        aria-label="heart up vote"
        size={'sm'}
        className={cn('transition-colors hover:bg-transparent', {
          'text-destructive': currentVote === 'UP_VOTE',
          'hover:text-destructive': currentVote !== 'UP_VOTE',
        })}
      >
        <Heart />
      </Button>

      <span className="text-lg">{voteAmt}</span>

      <Button
        onClick={() => Vote('DOWN_VOTE')}
        variant={'ghost'}
        aria-label="heart off vote"
        size={'sm'}
        className={cn('transition-colors hover:bg-transparent', {
          'text-destructive': currentVote === 'DOWN_VOTE',
          'hover:text-destructive': currentVote !== 'DOWN_VOTE',
        })}
      >
        <HeartOff />
      </Button>
    </div>
  );
};

export default memo(Vote);
