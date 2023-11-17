import {
  Bell,
  BringToFront,
  HeartPulse,
  Home,
  PlusCircle,
  Search,
} from 'lucide-react';
import type { Session } from 'next-auth';
import Link from 'next/link';
import { FC } from 'react';
import UserAvatar from '../User/UserAvatar';
import { buttonVariants } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';

interface MobileHeaderProps {
  session: Session | null;
}

const MobileHeader: FC<MobileHeaderProps> = ({ session }) => {
  return (
    <div className="flex items-center justify-around px-2 py-1">
      <Link href="/">
        <Home className="w-8 h-8" />
      </Link>
      <Link href="/search">
        <Search className="w-8 h-8" />
      </Link>
      <Link href="/create">
        <PlusCircle className="w-8 h-8" />
      </Link>
      {/* <Link href="/notify">
        <Bell className="w-8 h-8" />
      </Link> */}
      {!session ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <UserAvatar />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-[101] space-y-2">
            <DropdownMenuItem asChild>
              <a
                href={`${process.env.NEXT_PUBLIC_MAIN_URL}/sign-in`}
                className={buttonVariants({
                  className: 'w-full hover:cursor-pointer',
                })}
              >
                Đăng nhập
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={`${process.env.NEXT_PUBLIC_MAIN_URL}/sign-up`}
                className={buttonVariants({
                  className: 'w-full hover:cursor-pointer',
                })}
              >
                Đăng ký
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <UserAvatar user={session.user} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-[101] space-y-2 w-[100dvw]">
            <DropdownMenuItem asChild>
              <a
                href={`${process.env.NEXT_PUBLIC_MAIN_URL}`}
                className={buttonVariants({
                  className: 'w-full',
                })}
              >
                Đọc truyện
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={`${process.env.NEXT_PUBLIC_MANAGE_URL}/upload`}
                className={buttonVariants({
                  className: 'w-full',
                })}
              >
                Đăng truyện
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/follows"
                className={buttonVariants({ className: 'w-full space-x-1.5' })}
              >
                <HeartPulse />
                <span>Theo dõi</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/my-forums"
                className={buttonVariants({ className: 'w-full space-x-1.5' })}
              >
                <BringToFront />
                <span>Cộng đồng đã tạo</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default MobileHeader;
