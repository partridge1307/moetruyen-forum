'use client';

import { Input } from '@/components/ui/Input';
import { cn, tsquerySpecialChars } from '@/lib/utils';
import { useClickOutside, useDebouncedValue } from '@mantine/hooks';
import { SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import Highlighter from 'react-highlight-words';

interface SearchProps extends React.HTMLAttributes<HTMLDivElement> {
  forumId: number;
}

type TPostsResult = {
  id: string;
  title: string;
  slug: string;
  plainTextContent: string;
};

const cachedPostsResult = new Map<string, TPostsResult[] | null>(null);

const postLookUpService = {
  search: async (
    query: string,
    forumId: number,
    callback: (result: TPostsResult[]) => void
  ): Promise<void> => {
    fetch(`/api/search/post?q=${query}&id=${forumId}`, { method: 'GET' })
      .then((res) => {
        if (res.ok) return res.json() as Promise<TPostsResult[]>;
        else return null;
      })
      .then((res) => {
        if (!res) return;
        else return callback(res);
      });
  },
};

const Search: FC<SearchProps> = ({ forumId, className, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const ref = useClickOutside(() => setIsFocused(false));

  const [query, setQuery] = useState('');
  const [debouncedValue] = useDebouncedValue(query, 300);
  const [postsResult, setPostsResult] = useState<TPostsResult[]>([]);

  useEffect(() => {
    if (!debouncedValue.length) return;

    const cachedResults = cachedPostsResult.get(debouncedValue);

    if (cachedResults === null) return;
    if (cachedResults !== undefined) {
      setPostsResult(cachedResults);
      return;
    }

    cachedPostsResult.set(debouncedValue, null);
    postLookUpService.search(query, forumId, (result) => {
      cachedPostsResult.set(debouncedValue, result);
      setPostsResult(result);
    });
  }, [debouncedValue, forumId, query]);

  return (
    <div ref={ref} className="relative">
      <div className={cn('relative mb-4', className)} {...props}>
        <Input
          placeholder="Tìm kiếm bài viết"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        <SearchIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-70 hidden lg:block" />
      </div>

      {isFocused && !!debouncedValue.length && !!postsResult.length && (
        <ul className="absolute inset-x-0 top-12 max-h-52 z-10 space-y-2.5 rounded-md text-xl font-semibold overflow-y-auto bg-muted md:scrollbar md:scrollbar--dark">
          {postsResult.map((post) => (
            <Link
              key={post.id}
              href={`/m/${post.slug}/${post.id}`}
              className="flex flex-col p-2 rounded-md transition-colors hover:bg-primary-foreground/40"
            >
              {post.title}
              <Highlighter
                className="break-words text-base font-normal"
                autoEscape
                searchWords={debouncedValue
                  .replace(tsquerySpecialChars, ' ')
                  .trim()
                  .split(/\s+/)}
                textToHighlight={post.plainTextContent}
                highlightClassName="bg-yellow-800 text-white"
              />
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
