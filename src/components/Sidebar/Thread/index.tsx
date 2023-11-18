import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import Widget from './Widget';
import { getAuthSession } from '@/lib/auth';

interface indexProps {
  slug: string;
}

const Thread: FC<indexProps> = async ({ slug }) => {
  const [forum, session] = await Promise.all([
    db.subForum.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        slug: true,
        banner: true,
        title: true,
        canSend: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        subscriptions: {
          select: {
            isManager: true,
            user: {
              select: {
                name: true,
                color: true,
                image: true,
              },
            },
          },
        },
      },
    }),
    getAuthSession(),
  ]);
  if (!forum) return notFound();

  let isSubscribed = false,
    isOwner = false;
  if (session) {
    const subscription = await db.subscription.findUnique({
      where: {
        userId_subForumId: {
          userId: session.user.id,
          subForumId: forum.id,
        },
      },
    });

    if (subscription) isSubscribed = true;
    if (forum.creator.id === session.user.id) isOwner = true;
  }

  return (
    <Widget
      forum={forum}
      session={session}
      isSubscribed={isSubscribed}
      isOwner={isOwner}
    />
  );
};

export default Thread;
