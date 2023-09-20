import EditorSkeleton from './EditorSkeleton';

const PostCreateSkeleton = () => {
  return (
    <div className="space-y-6 text-sm">
      <div className="space-y-2">
        <p>Tiêu đề</p>
        <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="space-y-2">
        <p>Nội dung</p>
        <EditorSkeleton />
      </div>

      <div className="flex justify-end items-center gap-8">
        <div className="w-20 h-10 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-20 h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>
    </div>
  );
};

export default PostCreateSkeleton;
