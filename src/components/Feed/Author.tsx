import { FC, memo } from 'react';
import UserAvatar from '../User/UserAvatar';
import Username from '../User/Username';
import type { Post, SubForum, User } from '@prisma/client';
import { formatTimeToNow } from '@/lib/utils';

interface AuthorProps {
  post: Pick<Post, 'createdAt'> & {
    author: Pick<User, 'name' | 'image' | 'color'>;
    subForum: Pick<SubForum, 'title'>;
  };
}

const Author: FC<AuthorProps> = ({ post }) => {
  return (
    <a
      href={`${process.env.NEXT_PUBLIC_MAIN_URL}/user/${post.author.name
        ?.split(' ')
        .join('-')}`}
      className="flex items-center gap-4"
    >
      <UserAvatar user={post.author} className="w-14 h-14" />
      <div className="space-y-1">
        <Username user={post.author} className="text-start text-lg" />
        <div className="flex items-center gap-1.5">
          <p className="line-clamp-1">{post.subForum.title}</p>
          <span>•</span>
          <time
            dateTime={new Date(post.createdAt).toDateString()}
            className="opacity-75 shrink-0"
          >
            {formatTimeToNow(new Date(post.createdAt))}
          </time>
        </div>
      </div>
    </a>
  );
};

export default memo(Author);
