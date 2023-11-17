import { useElementSize } from '@mantine/hooks';
import type { Post, SubForum } from '@prisma/client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FC, memo } from 'react';

const MTOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  { ssr: false }
);

interface ContentProps {
  post: Pick<Post, 'id' | 'title' | 'content'> & {
    subForum: Pick<SubForum, 'slug'>;
  };
}

const Content: FC<ContentProps> = ({ post }) => {
  const { ref, height } = useElementSize();

  return (
    <Link
      href={`/m/${post.subForum.slug}/${post.id}`}
      className="block space-y-3"
    >
      <p className="text-3xl font-semibold line-clamp-2">{post.title}</p>

      <div ref={ref} className="relative max-h-72 overflow-hidden">
        <MTOutput id={post.id} content={post.content} />
        {height === 288 && (
          <div className="absolute inset-0 bg-gradient-to-t from-muted" />
        )}
      </div>
    </Link>
  );
};

export default memo(Content);
