'use client';

import { nFormatter } from '@/lib/utils';
import { useMediaQuery } from '@mantine/hooks';
import { SubForum, User } from '@prisma/client';
import { Compass, Users2 } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import UserAvatar from '../../User/UserAvatar';
import Username from '../../User/Username';

interface WidgetProps {
  forums: (Pick<SubForum, 'id' | 'slug' | 'title'> & {
    _count: {
      subscriptions: number;
    };
  })[];
  users: Pick<User, 'name' | 'color' | 'image'>[];
}

const Widget: FC<WidgetProps> = ({ forums, users }) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    !isMobile && (
      <aside className="hidden lg:block relative flex-1 p-3 space-y-10 border-l-2 border-primary h-screen max-h-screen overflow-auto hide_scrollbar">
        <div className="p-3 rounded-md bg-primary-foreground">
          <h1 className="flex items-center gap-2 ml-1 mb-4 text-xl font-semibold">
            <Compass />
            Xu hướng
          </h1>
          <ul className="space-y-3">
            {forums.map((forum) => (
              <li key={forum.id}>
                <Link
                  href={`/m/${forum.slug}`}
                  className="flex flex-col p-1 transition-colors rounded-md hover:bg-muted"
                >
                  <span className="text-lg font-semibold line-clamp-1">
                    {forum.title}
                  </span>
                  <span>
                    {nFormatter(forum._count.subscriptions, 1)} Thành viên
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/explore" className="block mt-2 p-2 text-blue-400">
            Xem thêm
          </Link>
        </div>

        <div className="p-3 rounded-md bg-primary-foreground">
          <h1 className="flex items-center gap-2 ml-1 mb-4 text-xl font-semibold">
            <Users2 />
            Người dùng
          </h1>
          <ul className="-ml-1 space-y-3">
            {users.map((user, idx) => (
              <li key={idx}>
                <a
                  href={`${process.env.NEXT_PUBLIC_MAIN_URL}/user/${user.name
                    ?.split(' ')
                    .join('-')}`}
                  className="flex items-center gap-1.5 transition-colors rounded-full hover:bg-muted"
                >
                  <UserAvatar user={user} />
                  <Username user={user} className="line-clamp-1" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    )
  );
};

export default Widget;
