import { Heart, HeartOff, Loader2 } from 'lucide-react';
import { FC } from 'react';
import { buttonVariants } from '../ui/Button';

interface CommentVoteSkeletonProps {}

const CommentVoteSkeleton: FC<CommentVoteSkeletonProps> = ({}) => {
  return (
    <div className="flex items-center gap-1">
      <button
        aria-label="loading like button"
        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
      >
        <Heart className="w-5 h-5" />
      </button>

      <Loader2 className="w-5 h-5 animate-spin" />

      <button
        aria-label="loading dislike button"
        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
      >
        <HeartOff className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CommentVoteSkeleton;
