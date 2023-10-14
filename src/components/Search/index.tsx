'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { useDebouncedValue } from '@mantine/hooks';
import type { Manga, SubForum, User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Search as SearchIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { Sheet, SheetContent, SheetTrigger } from '../ui/Sheet';

const MangaSearch = dynamic(() => import('@/components/Search/MangaSearch'), {
  ssr: false,
});
const UserSearch = dynamic(() => import('@/components/Search/UserSearch'), {
  ssr: false,
});
const ForumSearch = dynamic(() => import('@/components/Search/ForumSearch'), {
  ssr: false,
});
const SearchSkeleton = dynamic(
  () => import('@/components/Skeleton/SearchSkeleton')
);

export type SearchData = {
  mangas: Pick<Manga, 'id' | 'slug' | 'image' | 'name' | 'review'>[];
  users: Pick<User, 'name' | 'color' | 'image'>[];
  forums: Pick<SubForum, 'title' | 'slug' | 'banner'>[];
};

const searchResultsCache = new Map<string, SearchData | null>();

const Index = () => {
  const router = useRouter();
  const { serverErrorToast } = useCustomToast();

  const [searchResults, setSearchResults] = useState<SearchData>();
  const [query, setQuery] = useState('');
  const [debouncedValue] = useDebouncedValue(query, 300);

  const { mutate: Search, isLoading: isSearching } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.get(`/api/search?q=${debouncedValue}`);

      return data as SearchData;
    },
    onError: () => {
      return serverErrorToast();
    },
    onSuccess: (searchData) => {
      searchResultsCache.set(debouncedValue, searchData);
      setSearchResults(searchData);
    },
  });

  useEffect(() => {
    if (debouncedValue.length) {
      const cachedResults = searchResultsCache.get(debouncedValue);

      if (cachedResults === null) {
        return;
      }

      if (cachedResults !== undefined) {
        setSearchResults(cachedResults);
        return;
      }

      searchResultsCache.set(debouncedValue, null);
      Search();
    }
  }, [Search, debouncedValue]);

  return (
    <Sheet>
      <SheetTrigger>
        <SearchIcon className="w-7 h-7" aria-label="Search button" />
      </SheetTrigger>

      <SheetContent side={'top'} className="p-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();

            router.push(
              `${process.env.NEXT_PUBLIC_MAIN_URL}/search?q=${query}`
            );

            const target = document.getElementById('sheet-close-button');
            target?.click();
          }}
        >
          <Input
            name="q"
            autoComplete="off"
            placeholder="Tìm kiếm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-zinc-800"
          />
        </form>

        {isSearching && !!debouncedValue.length && <SearchSkeleton />}

        {!isSearching && !debouncedValue.length && (
          <p className="mt-6 px-1">Nhập nội dung bạn muốn tìm kiếm</p>
        )}

        {!isSearching && !!debouncedValue.length && (
          <Tabs defaultValue="manga" className="mt-6">
            <TabsList>
              <TabsTrigger value="manga">Manga</TabsTrigger>
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="forum">Forum</TabsTrigger>
            </TabsList>

            <TabsContent value="manga">
              <MangaSearch mangas={searchResults?.mangas} />
            </TabsContent>

            <TabsContent value="user">
              <UserSearch users={searchResults?.users} />
            </TabsContent>

            <TabsContent value="forum">
              <ForumSearch forums={searchResults?.forums} />
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Index;
