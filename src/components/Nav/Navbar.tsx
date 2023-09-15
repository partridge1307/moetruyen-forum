import { FacebookIcon } from 'lucide-react';
import Link from 'next/link';
import UserDropdown from '../Auth/UserDropdown';
import { Icons } from '../Icons';
import ThemeChangeClient from '../ThemeChangeClient';
import Sidebar from './Sidebar';

const Navbar = () => {
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
            <div className="flex items-center gap-4">
              <a target="_blank" href="https://www.facebook.com/Bfangteam">
                <FacebookIcon className="w-6 h-6" />
              </a>

              <a target="_blank" href="https://discord.gg/dongmoe">
                <Icons.discord className="w-6 h-6 dark:fill-white" />
              </a>
            </div>

            <UserDropdown />
          </div>
        </div>
      </nav>

      <ThemeChangeClient />
    </>
  );
};

export default Navbar;
