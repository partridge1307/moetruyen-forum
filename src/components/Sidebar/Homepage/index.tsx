import { db } from '@/lib/db';
import { shuffeArray } from '@/lib/utils';
import { IUA } from '@/types/user-agent';
import { headers } from 'next/headers';
import { getSelectorsByUserAgent } from 'react-device-detect';
import Widget from './Widget';

const Homepage = async () => {
  const ua = headers().get('user-agent') ?? '';
  const { isMobile } = getSelectorsByUserAgent(ua) as IUA;
  if (isMobile) return null;

  const [forums, users] = await db.$transaction([
    db.subForum.findMany({
      orderBy: {
        subscriptions: {
          _count: 'desc',
        },
      },
      take: 100,
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    }),
    db.user.findMany({
      orderBy: {
        post: {
          _count: 'desc',
        },
      },
      take: 100,
      select: {
        name: true,
        color: true,
        image: true,
      },
    }),
  ]);

  return (
    <Widget
      forums={shuffeArray(forums).slice(0, 5)}
      users={shuffeArray(users).slice(0, 5)}
    />
  );
};

export default Homepage;
