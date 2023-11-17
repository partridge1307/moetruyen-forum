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
import Username from '../User/Username';
import { buttonVariants } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';

interface TabletHeaderProps {
  session: Session | null;
}

const TabletHeader: FC<TabletHeaderProps> = ({ session }) => {
  return (
    <div className="h-[99%] flex flex-col justify-between">
      <div className="mt-8 text-lg font-medium space-y-5">
        <Link
          href="/"
          className="flex items-center gap-1.5 py-2 px-2 rounded-full transition-colors hover:bg-muted"
        >
          <Home />
          <span>Trang chủ</span>
        </Link>
        <Link
          href="/search"
          className="flex items-center gap-1.5 py-2 px-2 rounded-full transition-colors hover:bg-muted"
        >
          <Search />
          <span>Tìm kiếm</span>
        </Link>
        <Link
          href="/create"
          className="flex items-center gap-1.5 py-2 px-2 rounded-full transition-colors hover:bg-muted"
        >
          <PlusCircle />
          <span>Tạo cộng đồng</span>
        </Link>
        {/* <Link
          href="/notify"
          className="flex items-center gap-1.5 py-2 px-2 rounded-full transition-colors hover:bg-muted"
        >
          <Bell />
          <span>Thông báo</span>
        </Link> */}
        <Link
          href="/follows"
          className="flex items-center gap-1.5 py-2 px-2 rounded-full transition-colors hover:bg-muted"
        >
          <HeartPulse />
          <span>Theo dõi</span>
        </Link>
        <Link
          href="/my-forums"
          className="flex items-center gap-1.5 py-2 px-2 rounded-full transition-colors hover:bg-muted"
        >
          <BringToFront />
          <span>Cộng đồng đã tạo</span>
        </Link>
      </div>
      {!session ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 py-2 focus:outline-none">
            <UserAvatar />
            <span>Người dùng</span>
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
          <DropdownMenuTrigger className="flex items-center gap-2 py-2 focus:outline-none">
            <UserAvatar user={session.user} />
            <Username
              user={session.user}
              className="max-w-[9rem] line-clamp-1"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-[101] space-y-2">
            <DropdownMenuItem asChild>
              <a
                href={`${process.env.NEXT_PUBLIC_MAIN_URL}`}
                className={buttonVariants({
                  className: 'w-full hover:cursor-pointer',
                })}
              >
                Đọc truyện
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={`${process.env.NEXT_PUBLIC_MANAGE_URL}/upload`}
                className={buttonVariants({
                  className: 'w-full hover:cursor-pointer',
                })}
              >
                Đăng truyện
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default TabletHeader;
