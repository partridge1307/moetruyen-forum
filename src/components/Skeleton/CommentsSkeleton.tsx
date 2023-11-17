const CommentSkeleton = ({ length = 10 }: { length?: number }) => {
  return (
    <div className="space-y-10">
      <div className="w-full h-44 rounded-md animate-pulse dark:bg-zinc-900" />

      {Array.from(Array(length).keys()).map((_, i) => (
        <div key={i} className="flex gap-3 md:gap-6">
          <div
            aria-label="comment-skeleton"
            className="mt-2 w-12 h-12 rounded-full animate-pulse dark:bg-zinc-900"
          />
          <div className="relative w-full space-y-2">
            <div className="w-32 h-5 rounded-full animate-pulse dark:bg-zinc-900" />
            <div className="w-full h-36 rounded-md animate-pulse dark:bg-zinc-900" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentSkeleton;
