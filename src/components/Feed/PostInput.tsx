'use client';

import { SendHorizonal } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UserAvatar from '../User/UserAvatar';
import { memo } from 'react';

const PostInput = ({ slug }: { slug: string }) => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        router.push(`/m/${slug}/create`);
      }}
      className="mb-6 flex items-center space-x-2.5 hover:cursor-pointer"
    >
      <UserAvatar user={session?.user} />
      <div className="relative p-2 pl-4 w-full h-10 hover:cursor-pointer rounded-full bg-muted">
        <span className="opacity-50">Bạn đang nghĩ gì</span>
      </div>
      <SendHorizonal />
    </div>
  );
};

export default memo(PostInput);
