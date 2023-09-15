'use client';

import type { VoteType } from '@prisma/client';
import { MessageSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FC, useState } from 'react';
import { Button } from '../../ui/Button';
import CommentVote from './CommentVote';

const CommentInput = dynamic(() => import('./CommentInput'), {
  ssr: false,
});
const DeleteComment = dynamic(() => import('./DeleteComment'), { ssr: false });

interface CommentFuncProps {
  commentId: number;
  isAuthor: boolean;
  voteAmt: number;
  currentVote?: VoteType | null;
  callbackURL: string;
}

const CommentFunc: FC<CommentFuncProps> = ({
  commentId,
  isAuthor,
  voteAmt,
  currentVote,
  callbackURL,
}) => {
  const [showEditor, setShowEditor] = useState<boolean>(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <CommentVote
          commentId={commentId}
          callbackURL={callbackURL}
          currentVote={currentVote}
          voteAmt={voteAmt}
        />

        <Button
          onClick={() => setShowEditor((prev) => !prev)}
          variant={'ghost'}
          size={'sm'}
          className="hover:bg-transparent"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>

        {isAuthor && (
          <DeleteComment commentId={commentId} callbackURL={callbackURL} />
        )}
      </div>

      {showEditor && (
        <CommentInput
          isLoggedIn
          id={commentId}
          type="SUB_COMMENT"
          callbackURL={callbackURL}
        />
      )}
    </div>
  );
};

export default CommentFunc;
