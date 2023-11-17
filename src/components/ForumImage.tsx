import type { SubForum } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';

interface ForumImageProps extends React.HTMLAttributes<HTMLImageElement> {
  forum: Pick<SubForum, 'banner' | 'title'>;
  sizes?: string;
  priority?: boolean;
}

const ForumImage: FC<ForumImageProps> = ({
  forum,
  sizes = '30vw',
  priority,
  placeholder,
  ...props
}) => {
  return (
    <div className="relative aspect-video rounded-md">
      {!!forum.banner ? (
        <Image
          fill
          quality={40}
          sizes={sizes}
          priority={priority}
          src={forum.banner}
          alt={`Ảnh bìa ${forum.title}`}
          {...props}
        />
      ) : (
        <div className="w-full h-full rounded-md bg-background" />
      )}
    </div>
  );
};

export default ForumImage;
