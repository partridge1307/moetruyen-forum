'use client';

import { nFormatter } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import type { Session } from 'next-auth';
import { forwardRef, memo } from 'react';
import type { Posts } from '.';
import Author from './Author';
import Content from './Content';
import Vote from './Vote';
import { useRouter } from 'next/navigation';

interface PostCardProps {
  post: Posts;
  session: Session | null;
}

const PostCard = forwardRef<HTMLLIElement, PostCardProps>(
  ({ post, session }, ref) => {
    const router = useRouter();

    return (
      <li ref={ref} className="p-3 rounded-lg bg-muted">
        <Author post={post} />

        <div className="mt-3">
          <Content post={post} />
          <div className="mt-6 flex items-center gap-6">
            <Vote post={post} session={session} />
            <div
              className="flex items-center gap-1.5 hover:cursor-pointer"
              onClick={() => router.push(`/m/${post.subForum.slug}/${post.id}`)}
            >
              <MessageSquare />
              <span className="text-lg">
                {nFormatter(post._count.comments, 1)}
              </span>
            </div>
          </div>
        </div>
      </li>
    );
  }
);
PostCard.displayName = 'PostCard';

export default memo(PostCard);
