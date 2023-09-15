'use client';

import { CornerDownRight } from 'lucide-react';
import { FC, useState } from 'react';

interface SubCommentProps {
  subCommentLength: number;
  children: React.ReactNode;
}

const SubComment: FC<SubCommentProps> = ({ subCommentLength, children }) => {
  const [showReplies, setShowReplies] = useState<boolean>(false);

  return (
    <div>
      {showReplies ? (
        children
      ) : (
        <button
          aria-label="commentreplies"
          className="flex items-center gap-1"
          onClick={() => setShowReplies(true)}
        >
          <CornerDownRight className="w-4 h-4" />
          <span className="hover:underline underline-offset-1">
            {subCommentLength} trả lời
          </span>
        </button>
      )}
    </div>
  );
};

export default SubComment;
