'use client';

import type { Prisma } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC, useState } from 'react';
import { useElementSize } from '@mantine/hooks';
import { cn } from '@/lib/utils';

const MoetruyenEditorOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  { ssr: false }
);

interface CommentProps {
  id: number;
  content: Prisma.JsonValue;
}

const CommentContent: FC<CommentProps> = ({ id, content }): JSX.Element => {
  const { ref, height } = useElementSize();
  const [hasExpand, setExpand] = useState(false);

  return (
    <div
      ref={ref}
      className={cn(
        'relative max-h-72 p-2 rounded-lg overflow-hidden dark:bg-zinc-900/40',
        {
          'max-h-none': hasExpand,
        }
      )}
    >
      <MoetruyenEditorOutput id={id} content={content} />
      {!hasExpand && height === 272 && (
        <button
          aria-label="expand button"
          className="absolute bottom-0 inset-x-0 h-10 rounded-b-lg bg-gradient-to-t dark:from-zinc-900"
          onClick={() => setExpand(true)}
        >
          Xem thêm
        </button>
      )}
    </div>
  );
};

export default CommentContent;
