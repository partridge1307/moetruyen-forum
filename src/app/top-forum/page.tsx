import PaginationControll from '@/components/PaginationControll';
import { db } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top Forum',
  description: 'Top cộng đồng | Moetruyen',
  alternates: {
    canonical: `${process.env.NEXTAUTH_URL}/top-forum`,
  },
  keywords: ['Top', 'Forum', 'Moetruyen'],
  openGraph: {
    siteName: 'Moetruyen Forum',
    url: `${process.env.NEXTAUTH_URL}/top-forum`,
    title: 'Top Forum',
    description: 'Top cộng đồng | Moetruyen',
  },
  twitter: {
    site: 'Moetruyen Forum',
    title: 'Top Forum',
    description: 'Top cộng đồng | Moetruyen',
  },
};

interface pageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const page = searchParams['page'] ?? '1';
  const limit = searchParams['limit'] ?? '10';

  const start = (Number(page) - 1) * Number(limit);

  const [subForums, totalSubForums] = await db.$transaction([
    db.subForum.findMany({
      orderBy: {
        subscriptions: {
          _count: 'desc',
        },
      },
      take: Number(limit),
      skip: start,
      select: {
        id: true,
        title: true,
        banner: true,
        slug: true,
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    }),
    db.subForum.count(),
  ]);

  return (
    <main className="container max-sm:px-2 lg:w-4/5 space-y-10">
      <h1 className="text-xl font-semibold">Top Forum</h1>

      <section className="grid md:grid-cols-2 gap-4 rounded-md dark:bg-zinc-900/60">
        {!!subForums.length ? (
          subForums.map((sub) => (
            <Link
              key={sub.id}
              href={`/${sub.slug}`}
              className="grid grid-cols-[.5fr_1fr] gap-4 p-2 rounded-md transition-colors hover:dark:bg-zinc-900"
            >
              {!!sub.banner && (
                <div className="relative aspect-video">
                  <Image
                    fill
                    sizes="(max-width: 640px) 20vw, 30vw"
                    quality={40}
                    src={sub.banner}
                    alt={`${sub.title} Banner`}
                    className="object-cover rounded-md"
                  />
                </div>
              )}
              <dl>
                <dt className="text-lg font-semibold">{sub.title}</dt>
                <dd>
                  {sub._count.subscriptions} <span>Members</span>
                </dd>
              </dl>
            </Link>
          ))
        ) : (
          <p>Chưa có cộng đồng nào được tạo</p>
        )}
      </section>

      <PaginationControll total={totalSubForums} route={`/top-forum?`} />
    </main>
  );
};

export default page;
