'use client';

import { useComments } from '@/hooks/use-comment';
import { useIntersection, usePrevious } from '@mantine/hooks';
import type { PostComment, PostVote, User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { FC, useEffect, useRef, useState } from 'react';
import CommentCard from './CommentCard';
import CommentInput from './components/CommentInput';

const DeleteComment = dynamic(() => import('./components/DeleteComment'), {
  ssr: false,
});

interface indexProps {
  id: number;
  session: Session | null;
  isManager: boolean;
}

export type ExtendedComment = Pick<
  PostComment,
  'id' | 'content' | 'oEmbed' | 'creatorId' | 'createdAt'
> & {
  creator: Pick<User, 'name' | 'color' | 'image'>;
  votes: PostVote[];
  _count: {
    replies: number;
  };
};

const Comments: FC<indexProps> = ({ id, session, isManager }) => {
  const lastCommentRef = useRef(null);
  const { ref, entry } = useIntersection({
    threshold: 1,
    root: lastCommentRef.current,
  });
  const [comments, setComments] = useState<ExtendedComment[]>([]);
  const prevComments = usePrevious(comments);

  const {
    data: commentsData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useComments<ExtendedComment>(id, `/api/comment/${id}`);

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, fetchNextPage, hasNextPage]);

  useEffect(() => {
    setComments(commentsData?.pages.flatMap((page) => page.comments) ?? []);
  }, [commentsData?.pages]);

  return (
    <>
      {!!session ? (
        <CommentInput
          type="COMMENT"
          session={session}
          postId={id}
          setComments={setComments}
          prevComment={prevComments}
        />
      ) : (
        <p>
          Vui lòng <span className="font-semibold">đăng nhập</span> hoặc{' '}
          <span className="font-semibold">đăng ký</span> để bình luận
        </p>
      )}

      <ul className="space-y-12">
        {comments.map((comment, idx) => {
          if (idx === comments.length - 1)
            return (
              <li key={comment.id} ref={ref} className="flex gap-4">
                <CommentCard
                  comment={comment}
                  session={session}
                  isManager={isManager}
                >
                  {(comment.creatorId === session?.user.id || isManager) && (
                    <DeleteComment
                      type="COMMENT"
                      commentId={comment.id}
                      APIQuery={`/api/comment/${comment.id}`}
                      setComments={setComments}
                    />
                  )}
                </CommentCard>
              </li>
            );
          else
            return (
              <li key={comment.id} className="flex gap-4">
                <CommentCard
                  comment={comment}
                  session={session}
                  isManager={isManager}
                >
                  {(comment.creatorId === session?.user.id || isManager) && (
                    <DeleteComment
                      type="COMMENT"
                      commentId={comment.id}
                      APIQuery={`/api/comment/${comment.id}`}
                      setComments={setComments}
                    />
                  )}
                </CommentCard>
              </li>
            );
        })}
      </ul>

      {isFetchingNextPage && (
        <p className="flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin" />
        </p>
      )}
    </>
  );
};

export default Comments;
