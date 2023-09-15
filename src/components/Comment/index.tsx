'use client';

import { useComments } from '@/hooks/use-comment';
import { useIntersection } from '@mantine/hooks';
import type { PostComment, PostVote, User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import CommentCard from './CommentCard';

const CommentInput = dynamic(() => import('./components/CommentInput'), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-md animate-pulse dark:bg-zinc-900" />
  ),
});

const CALLBACK_URL = '/api/comment/forum';

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

interface ComemntProps {
  postId: number;
}

const Comemnts = ({ postId }: ComemntProps) => {
  const { data: session } = useSession();

  const lastCmtRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    threshold: 1,
    root: lastCmtRef.current,
  });

  const {
    data: CommentData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useComments<ExtendedComment>(postId, CALLBACK_URL);

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, fetchNextPage, hasNextPage]);

  const comments = CommentData?.pages.flatMap((page) => page.comments);

  return (
    <>
      <CommentInput
        isLoggedIn={!!session}
        id={postId}
        type="COMMENT"
        callbackURL={CALLBACK_URL}
        refetch={refetch}
      />

      <ul className="space-y-10">
        {!!comments?.length ? (
          comments.map((comment, idx) => {
            if (idx === comments.length - 1) {
              return (
                <li key={comment.id} ref={ref} className="flex gap-3 md:gap-6">
                  <CommentCard
                    comment={comment}
                    userId={session?.user.id}
                    callbackURL={CALLBACK_URL}
                  />
                </li>
              );
            } else {
              return (
                <li key={comment.id} className="flex gap-3 md:gap-6">
                  <CommentCard
                    comment={comment}
                    userId={session?.user.id}
                    callbackURL={CALLBACK_URL}
                  />
                </li>
              );
            }
          })
        ) : (
          <li className="text-center">
            Hãy làm người đầu tiên <span className="font-bold">comment</span>{' '}
            nào
          </li>
        )}

        {isFetchingNextPage && (
          <li className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </li>
        )}
      </ul>
    </>
  );
};

export default Comemnts;
