import { Bell, FacebookIcon, Menu } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import UserDropdown from '../Auth/UserDropdown';
import { Icons } from '../Icons';
import ThemeChangeClient from '../ThemeChangeClient';
import { Search as SearchIcon } from 'lucide-react';
import { getAuthSession } from '@/lib/auth';

const Sidebar = dynamic(() => import('./Sidebar'), {
  loading: () => (
    <Menu aria-label="sidebar button skeleton" className="h-8 w-8" />
  ),
});
const Search = dynamic(() => import('@/components/Search/index'), {
  ssr: false,
  loading: () => <SearchIcon className="w-7 h-7" aria-label="Search button" />,
});
const Notify = dynamic(() => import('@/components/Notify'), {
  ssr: false,
  loading: () => <Bell aria-label="Notify button" className="w-7 h-7" />,
});

const Navbar = async () => {
  const session = await getAuthSession();

  return (
    <>
      <nav className="sticky inset-x-0 top-0 mb-4 lg:mb-10 h-fit p-2 z-30 border-b bg-slate-100 dark:bg-zinc-800">
        <div className="container max-sm:px-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sidebar />
            <Link href="/" className="flex items-center space-x-2">
              <Icons.logo
                aria-label="Moetruyen Logo"
                className="w-6 h-6 dark:fill-white"
              />

              <p
                aria-label="Moetruyen"
                className="relative text-xl font-semibold max-sm:hidden"
              >
                Moetruyen
                <span className="absolute top-0 -right-1 -translate-y-[22%] translate-x-[40%]">
                  <span className="relative block text-xs font-normal h-fit px-1 rotate-[10deg] after:content-[''] after:absolute after:inset-0 after:-z-10 after:bg-blue-500 after:-skew-x-[20deg]">
                    FORUM
                  </span>
                </span>
              </p>
            </Link>
          </div>

          <div className="flex items-center gap-8">
            <Search />

            {!!session && <Notify session={session} />}

            <UserDropdown />
          </div>
        </div>
      </nav>

      <ThemeChangeClient />
    </>
  );
};

export default Navbar;
