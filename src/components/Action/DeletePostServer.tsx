import { db } from '@/lib/db';
import type { Post, SubForum } from '@prisma/client';
import type { Session } from 'next-auth';
import { FC } from 'react';
import DeletePostButton from './DeletePostButton';

interface DeletePostServerProps {
  session: Session;
  post: Pick<Post, 'id' | 'authorId' | 'subForumId'> & {
    subForum: Pick<SubForum, 'slug'>;
  };
}

const DeletePostServer: FC<DeletePostServerProps> = async ({
  session,
  post,
}) => {
  const subscription = await db.subscription.findUnique({
    where: {
      userId_subForumId: {
        userId: session.user.id,
        subForumId: post.subForumId,
      },
    },
    select: {
      isManager: true,
    },
  });

  return (
    ((!!subscription && !!subscription.isManager) ||
      session.user.id === post.authorId) && <DeletePostButton post={post} />
  );
};

export default DeletePostServer;
