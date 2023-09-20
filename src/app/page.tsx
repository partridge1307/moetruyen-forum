import GeneralFeed from '@/components/Feed/GeneralFeed';
import SubscribedFeed from '@/components/Feed/SubscribedFeed';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn, shuffeArray } from '@/lib/utils';
import { ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

const page = async () => {
  const [subForums, session] = await Promise.all([
    db.subForum.findMany({
      orderBy: {
        subscriptions: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      take: 100,
    }),
    getAuthSession(),
  ]);

  return (
    <main className="container max-sm:px-2 grid grid-cols-1 lg:grid-cols-[1fr_.45fr] gap-6">
      <section className="space-y-2">
        <h1 className="text-xl font-semibold">Bài viết</h1>
        {session ? <SubscribedFeed session={session} /> : <GeneralFeed />}
      </section>

      <section className="order-first lg:order-last h-fit rounded-md dark:bg-zinc-900">
        <h1 className="text-lg font-semibold flex items-center gap-1 p-3 rounded-t-md dark:bg-zinc-700">
          <Home className="w-5 h-5" /> Trang chủ
        </h1>

        <div className="space-y-8 p-2 py-4">
          <Link href="/create" className={cn(buttonVariants(), 'w-full')}>
            <span className="font-medium">Tạo cộng đồng</span>
          </Link>

          <div className="text-start space-y-4">
            <h1>Cộng đồng nổi bật</h1>

            <ul className="space-y-2">
              {shuffeArray(subForums)
                .slice(0, 5)
                .map((subForum) => (
                  <li key={subForum.id}>
                    <Link href={`/${subForum.slug}`}>
                      <div className="p-2 rounded-md hover:dark:bg-zinc-800">
                        <p>
                          m/<span>{subForum.title}</span>
                        </p>
                        <p className="text-sm">
                          {subForum._count.subscriptions} member
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>

            <Link
              href="/top-forum"
              aria-label="top forum button"
              className={cn(
                buttonVariants({
                  variant: 'link',
                }),
                'space-x-2 px-0'
              )}
            >
              <span>Cộng đồng nổi bật khác</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
