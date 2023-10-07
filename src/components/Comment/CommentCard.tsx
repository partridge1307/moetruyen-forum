import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { buttonVariants } from '@/components/ui/Button';
import { formatTimeToNow } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { FC, useRef } from 'react';
import { ExtendedComment } from '.';
import CommentVoteSkeleton from '../Skeleton/CommentVoteSkeleton';
import CommentContent from './components/CommentContent';
import CommentOEmbed from './components/CommentOEmbed';
import SubCommentWrapper from './components/SubCommentWrapper';

const CommentVote = dynamic(() => import('./components/CommentVote'), {
  ssr: false,
  loading: () => <CommentVoteSkeleton />,
});
const SubComment = dynamic(() => import('./SubComment'), { ssr: false });

interface CommentCardProps {
  comment: ExtendedComment;
  session: Session | null;
  isManager: boolean;
  children: React.ReactNode;
}

const CommentCard: FC<CommentCardProps> = ({
  comment,
  session,
  isManager,
  children,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <UserAvatar user={comment.creator} />

      <div className="min-w-0 space-y-1">
        <dl className="flex flex-wrap items-center gap-2">
          <dt>
            <Username user={comment.creator} className="text-start" />
          </dt>
          <dd className="text-sm">
            <time dateTime={new Date(comment.createdAt).toDateString()}>
              {formatTimeToNow(new Date(comment.createdAt))}
            </time>
          </dd>
        </dl>

        <div className="space-y-2">
          <CommentContent id={comment.id} content={comment.content} />

          {!!comment.oEmbed && <CommentOEmbed oEmbed={comment.oEmbed} />}

          {!!session && (
            <div className="flex items-center gap-4">
              <CommentVote
                isSending={comment.isSending}
                commentId={comment.id}
                votes={comment.votes}
                sessionUserId={session.user.id}
              />

              <button
                aria-label="comment button"
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                onClick={() => buttonRef.current?.click()}
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              {children}
            </div>
          )}

          <SubCommentWrapper
            ref={buttonRef}
            subCommentLength={comment._count.replies}
          >
            <SubComment
              commentId={comment.id}
              session={session}
              isManager={isManager}
            />
          </SubCommentWrapper>
        </div>
      </div>
    </>
  );
};

export default CommentCard;
