import { db } from '@/lib/db';
import type { Session } from 'next-auth';
import { FC } from 'react';
import DeletePostButton from './DeletePostButton';

interface DeletePostServerProps {
  session: Session;
  postId: number;
  subForumId: number;
  authorId: string;
  slug: string;
}

const DeletePostServer: FC<DeletePostServerProps> = async ({
  session,
  postId,
  subForumId,
  authorId,
  slug,
}) => {
  const subscription = await db.subscription.findUnique({
    where: {
      userId_subForumId: {
        userId: session.user.id,
        subForumId,
      },
    },
    select: {
      isManager: true,
    },
  });

  return (
    ((!!subscription && !!subscription.isManager) ||
      session.user.id === authorId) && (
      <DeletePostButton postId={postId} subForumSlug={slug} />
    )
  );
};

export default DeletePostServer;
