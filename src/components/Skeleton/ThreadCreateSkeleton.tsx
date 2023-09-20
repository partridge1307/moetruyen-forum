import ThreadImageSkeleton from './ThreadImageSkeleton';

const ThreadCreateSkeleton = () => {
  return (
    <div className="text-sm space-y-6">
      <ThreadImageSkeleton />

      <div className="space-y-2">
        <p>Tên cộng đồng</p>
        <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="space-y-2">
        <p>Slug</p>
        <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="space-y-2">
        <p>Cho phép người khác đăng bài</p>
        <div className="h-4 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="flex justify-end items-center gap-8">
        <div className="w-20 h-10 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-20 h-10 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>
    </div>
  );
};

export default ThreadCreateSkeleton;
