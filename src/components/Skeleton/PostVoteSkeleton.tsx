import { buttonVariants } from '@/components/ui/Button';
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react';

const PostVoteSkeleton = (): JSX.Element => (
  <div className="flex items-center gap-1 rounded-xl dark:bg-zinc-800">
    <div
      aria-label="up vote"
      className={buttonVariants({ variant: 'ghost', size: 'sm' })}
    >
      <ArrowBigUp className="w-6 h-6" />
    </div>
    <p>
      <Loader2 className="w-4 h-4 animate-spin" />
    </p>
    <div
      aria-label="down vote"
      className={buttonVariants({ variant: 'ghost', size: 'sm' })}
    >
      <ArrowBigDown className="w-6 h-6" />
    </div>
  </div>
);

export default PostVoteSkeleton;
