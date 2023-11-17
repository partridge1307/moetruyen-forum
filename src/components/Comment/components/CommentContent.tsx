'use client';

import { cn } from '@/lib/utils';
import { useElementSize } from '@mantine/hooks';
import type { Prisma } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC, memo, useState } from 'react';

const MoetruyenEditorOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  { ssr: false }
);

interface CommentProps extends React.HTMLAttributes<HTMLDivElement> {
  commentId: number;
  commentContent: Prisma.JsonValue;
}

const CommentContent: FC<CommentProps> = ({
  commentId,
  commentContent,
  className,
  ...props
}) => {
  const { ref, height } = useElementSize();
  const [hasExpand, setExpand] = useState(false);

  return (
    <div
      ref={ref}
      className={cn(
        'relative max-h-72 p-2 rounded-lg overflow-hidden bg-muted',
        {
          'max-h-none': hasExpand,
        },
        className
      )}
      {...props}
    >
      <MoetruyenEditorOutput id={commentId} content={commentContent} />
      {!hasExpand && height === 272 && (
        <button
          aria-label="expand button"
          className="absolute bottom-0 inset-x-0 h-10 rounded-b-lg bg-gradient-to-t dark:from-background"
          onClick={() => setExpand(true)}
        >
          Xem thêm
        </button>
      )}
    </div>
  );
};

export default memo(CommentContent);
