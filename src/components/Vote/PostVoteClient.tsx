'use client';

import { Button } from '@/components/ui/Button';
import { useVote } from '@/hooks/use-vote';
import { cn } from '@/lib/utils';
import type { VoteType } from '@prisma/client';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { FC } from 'react';

interface PostVoteClientProps {
  postId: number;
  voteAmt: number;
  currentVote?: VoteType;
}

const PostVoteClient: FC<PostVoteClientProps> = ({
  postId,
  voteAmt: initialVoteAmt,
  currentVote: initialVote,
}) => {
  const { Vote, voteAmt, currentVote } = useVote(
    postId,
    `/api/m`,
    initialVoteAmt,
    initialVote
  );

  return (
    <div className="flex items-center gap-1 rounded-xl dark:bg-zinc-800">
      <Button
        onClick={() => Vote('UP_VOTE')}
        variant={'ghost'}
        size={'sm'}
        aria-label="up vote"
        className={cn('transition-colors hover:bg-transparent', {
          'text-red-500 hover:text-red-500': currentVote === 'UP_VOTE',
        })}
      >
        <ArrowBigUp className="w-6 h-6" />
      </Button>

      <p>{voteAmt}</p>

      <Button
        onClick={() => Vote('DOWN_VOTE')}
        variant={'ghost'}
        size={'sm'}
        aria-label="down vote"
        className={cn('transition-colors hover:bg-transparent', {
          'text-red-500 hover:text-red-500': currentVote === 'DOWN_VOTE',
        })}
      >
        <ArrowBigDown className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default PostVoteClient;
