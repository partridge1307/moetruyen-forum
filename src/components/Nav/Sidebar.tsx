import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/Sheet';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Home, Menu } from 'lucide-react';
import ThemeSwitch from '../ThemeSwitch';
import Link from 'next/link';
import { buttonVariants } from '../ui/Button';
import { cn } from '@/lib/utils';

const Sidebar = async () => {
  const session = await getAuthSession();

  let subForum;
  if (session) {
    subForum = await db.subForum.findMany({
      where: {
        creatorId: session.user.id,
      },
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });
  }

  return (
    <Sheet>
      <SheetTrigger>
        <Menu aria-label="sidebar button" className="h-8 w-8" />
      </SheetTrigger>

      <SheetContent
        side={'left'}
        className="p-0 flex flex-col gap-0 dark:bg-zinc-900"
      >
        <aside className="flex-1 max-h-full px-3 space-y-4 overflow-auto scrollbar dark:scrollbar--dark">
          <section className="sticky top-0 flex justify-center pt-6 pb-3 z-10 dark:bg-zinc-900">
            <h1 className="relative text-xl lg:text-2xl font-semibold">
              Moetruyen
              <p className="absolute top-0 -right-1 translate-x-2/4 -translate-y-1/4">
                <span className="relative block h-fit px-1 rotate-12 text-sm after:content-[''] after:absolute after:inset-0 after:-z-10 after:bg-blue-500 after:-skew-x-[20deg]">
                  FORUM
                </span>
              </p>
            </h1>
          </section>

          <section className="space-y-10">
            <a
              href={process.env.MAIN_URL!}
              className="flex justify-center items-center space-x-2 p-2 font-semibold text-lg rounded-md dark:bg-zinc-800"
            >
              <Home className="w-5 h-5" />
              <span>Trang chủ</span>
            </a>

            <div className="space-y-5">
              {!!session && (
                <SheetClose asChild>
                  <Link
                    href="/followed-subforum"
                    className={cn(buttonVariants(), 'w-full py-6')}
                  >
                    Subforum đang theo dõi
                  </Link>
                </SheetClose>
              )}

              <div className="space-y-2">
                <h2 className="text-lg font-semibold">SubForum của bạn</h2>
                {!!session && !!subForum ? (
                  subForum?.length ? (
                    <div className="space-y-2 overflow-auto scrollbar dark:scrollbar--dark">
                      {subForum.map((sub) => (
                        <SheetClose key={sub.id} asChild>
                          <Link
                            href={`/${sub.slug}`}
                            className="block p-3 rounded-md transition-colors dark:bg-zinc-800 hover:dark:bg-zinc-800/80 font-medium"
                          >
                            {sub.title}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  ) : (
                    <p>Bạn chưa tạo SubForum nào</p>
                  )
                ) : (
                  <p>Vui lòng đăng nhập hoặc đăng ký</p>
                )}
              </div>
            </div>
          </section>
        </aside>

        <footer className="flex justify-between items-center p-2 dark:bg-zinc-800">
          <div>
            <p className="text-lg">©Moetruyen</p>
            <p className="text-sm">Version 9w2</p>
          </div>

          <ThemeSwitch />
        </footer>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
