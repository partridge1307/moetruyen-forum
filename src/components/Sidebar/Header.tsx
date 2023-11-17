'use client';

import { useMediaQuery } from '@mantine/hooks';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Icons } from '../Icons';
import MobileHeader from './MobileHeader';
import TabletHeader from './TabletHeader';

const Header = () => {
  const { data: session } = useSession();

  const isTablet = useMediaQuery('(min-width: 768px)');

  return (
    <header className="z-[100] sticky bottom-0 md:top-0 w-screen md:w-fit md:h-full py-2 md:p-6 order-last md:order-first border-t-2 md:border-t-0 md:border-r-2 border-primary bg-primary-foreground">
      <Link
        href="/"
        className="hidden md:flex items-center space-x-2 md:mr-8 px-2"
      >
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

      {isTablet ? (
        <TabletHeader session={session} />
      ) : (
        <MobileHeader session={session} />
      )}
    </header>
  );
};

export default Header;
