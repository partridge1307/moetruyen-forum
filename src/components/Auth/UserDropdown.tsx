import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { getAuthSession } from '@/lib/auth';
import { cn } from '@/lib/utils';
import UserAvatar from '../User/UserAvatar';
import UserBanner from '../User/UserBanner';
import Username from '../User/Username';
import { buttonVariants } from '../ui/Button';
import SignOutButton from './SignOutButton';

const UserDropdown = async () => {
  const session = await getAuthSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar user={session?.user} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={`${session?.user ? 'min-w-[300px] space-y-4' : ''}`}
      >
        {session?.user ? (
          <>
            <div>
              <div className="relative">
                <UserBanner user={session.user} className="rounded-md" />
                <UserAvatar
                  user={session.user}
                  className="absolute w-20 h-20 bottom-0 translate-y-1/2 left-4 border-4 dark:border-zinc-900"
                />
              </div>

              <Username
                user={session.user}
                className="mt-14 text-start pl-4 text-lg font-semibold"
              />
            </div>

            <a href="/" className={cn(buttonVariants(), 'w-full')}>
              Quản lý
            </a>

            <SignOutButton />
          </>
        ) : (
          <>
            <DropdownMenuItem>Đăng nhập</DropdownMenuItem>
            <DropdownMenuItem>Đăng ký</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
