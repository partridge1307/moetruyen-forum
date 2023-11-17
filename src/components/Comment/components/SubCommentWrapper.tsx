'use client';

import { cn } from '@/lib/utils';
import { CornerDownRight } from 'lucide-react';
import { forwardRef, memo, useState } from 'react';

interface SubCommentProps {
  subCommentLength: number;
  children: React.ReactNode;
}

const SubCommentWrapper = forwardRef<HTMLButtonElement, SubCommentProps>(
  function SubCommentWrapper({ subCommentLength, children }, ref) {
    const [showReplies, setShowReplies] = useState(false);

    return showReplies ? (
      children
    ) : (
      <button
        ref={ref}
        aria-label="comment replies"
        className={cn('flex items-center gap-1', {
          hidden: subCommentLength === 0,
        })}
        onClick={() => setShowReplies(true)}
      >
        <CornerDownRight className="w-4 h-4" />
        <span className="hover:underline underline-offset-1">
          {subCommentLength} trả lời
        </span>
      </button>
    );
  }
);

export default memo(SubCommentWrapper);
