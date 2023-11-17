'use client';

import { useDebouncedValue } from '@mantine/hooks';
import { SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ForumImage from '../ForumImage';
import { Input } from '../ui/Input';

type TForumResult = {
  slug: string;
  banner: string;
  title: string;
};

const cachedResults = new Map<string, TForumResult[] | null>(null);

const forumLookUpService = {
  search: async (query: string, callback: (result: TForumResult[]) => void) => {
    fetch(`/api/search?q=${query}`, { method: 'GET' })
      .then((res) => {
        if (res.ok) return res.json() as Promise<TForumResult[]>;
        else return null;
      })
      .then((res) => {
        if (!res) return;
        return callback(res);
      });
  },
};

const Search = ({}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [debouncedValue] = useDebouncedValue(query, 300);

  const [results, setResults] = useState<TForumResult[]>([]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (!q) return;

    setQuery(q);
    cachedResults.set(q, null);
    forumLookUpService.search(q, (result) => {
      cachedResults.set(q, result);
      setResults(result);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!debouncedValue.length) return;
    router.replace(`/search?q=${debouncedValue}`);

    const cachedPostsResult = cachedResults.get(debouncedValue);

    if (cachedPostsResult === null) return;

    if (cachedPostsResult !== undefined) {
      setResults(cachedPostsResult);
      return;
    }

    cachedResults.set(debouncedValue, null);
    forumLookUpService.search(query, (result) => {
      cachedResults.set(debouncedValue, result);
      setResults(result);
    });
  }, [debouncedValue, query, router]);

  return (
    <>
      <div className="relative">
        <Input
          placeholder="Nội dung tìm kiếm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50" />
      </div>

      <div className="mt-3">
        <h1 className="text-2xl font-semibold">Kết quả</h1>

        {!debouncedValue.length && <p>Vui lòng nhập nội dung tìm kiếm</p>}

        {!!debouncedValue.length && !results.length && <p>Không có kết quả</p>}

        {!!debouncedValue.length && !!results.length && (
          <ul className="mt-2 space-y-4">
            {results.map((forum, idx) => (
              <li key={`${forum.slug}-${idx}`}>
                <Link
                  href={`/m/${forum.slug}`}
                  className="grid grid-cols-[.4fr_1fr] gap-3 rounded-md transition-colors hover:bg-muted"
                >
                  <ForumImage forum={forum} sizes="25vw" />
                  <p className="text-xl font-semibold line-clamp-2 md:line-clamp-3">
                    {forum.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Search;
