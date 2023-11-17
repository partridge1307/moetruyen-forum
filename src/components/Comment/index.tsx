'use client';

import { useComments } from '@/hooks/use-comment';
import { cn } from '@/lib/utils';
import { useIntersection } from '@mantine/hooks';
import type { PostComment, PostCommentVote, User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CommentCard from './CommentCard';
import { CommentInputProps } from './components/CommentInput';
import type { DeleteCommentProps } from './components/DeleteComment';

const CommentInput = dynamic<CommentInputProps<ExtendedComment>>(
  () => import('./components/CommentInput'),
  {
    ssr: false,
  }
);
const DeleteComment = dynamic<DeleteCommentProps<ExtendedComment>>(
  () => import('./components/DeleteComment'),
  {
    ssr: false,
  }
);

const API_QUERY = '/api/comment';

export type ExtendedComment = Pick<
  PostComment,
  'id' | 'content' | 'oEmbed' | 'creatorId' | 'createdAt'
> & {
  creator: Pick<User, 'name' | 'image' | 'color'>;
  votes: PostCommentVote[];
  _count: { replies: number };
  isSending?: boolean;
};

interface CommentProps {
  id: number;
  session: Session | null;
}

const Comments = ({ id, session }: CommentProps) => {
  const lastCmtRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    threshold: 1,
    root: lastCmtRef.current,
  });
  const [comments, setComments] = useState<ExtendedComment[]>([]);

  const {
    data: commentsData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useComments<ExtendedComment>(id, `${API_QUERY}/${id}`);

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
          id={id}
          session={session}
          setComments={setComments}
          APIQuery={API_QUERY}
        />
      ) : (
        <p className="mt-4">
          Vui lòng{' '}
          <a
            href={`${process.env.NEXT_PUBLIC_MAIN_URL}/sign-in`}
            className="font-semibold"
          >
            đăng nhập
          </a>{' '}
          hoặc{' '}
          <a
            href={`${process.env.NEXT_PUBLIC_MAIN_URL}/sign-up`}
            className="font-semibold"
          >
            đăng ký
          </a>{' '}
          để bình luận
        </p>
      )}

      <ul className="space-y-10 mt-10">
        {comments.map((comment, idx) => {
          if (idx === comments.length - 1)
            return (
              <li
                key={comment.id}
                ref={ref}
                className={cn('flex gap-4', {
                  'opacity-70': comment.isSending,
                })}
              >
                <CommentCard comment={comment} session={session}>
                  {comment.creatorId === session?.user.id && (
                    <DeleteComment
                      isSending={comment.isSending}
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
              <li
                key={comment.id}
                className={cn('flex gap-4', {
                  'opacity-70': comment.isSending,
                })}
              >
                <CommentCard comment={comment} session={session}>
                  {comment.creatorId === session?.user.id && (
                    <DeleteComment
                      isSending={comment.isSending}
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
