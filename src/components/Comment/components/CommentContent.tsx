'use client';

import type { Prisma } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import { useElementSize } from '@mantine/hooks';

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

  return (
    <div
      ref={ref}
      className="w-fit max-h-72 p-2 rounded-lg overflow-hidden dark:bg-zinc-900/40"
    >
      <MoetruyenEditorOutput id={id} content={content} />
    </div>
  );
};

export default CommentContent;
