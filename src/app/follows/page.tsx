import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ForumImage from '@/components/ForumImage';
import PaginationControll from '@/components/PaginationControll';

interface pageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const Homepage = dynamic(() => import('@/components/Sidebar/Homepage'));

const page: FC<pageProps> = async ({ searchParams }) => {
  const page = searchParams['page'] ?? '1';
  const limit = searchParams['limit'] ?? '20';

  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.NEXT_PUBLIC_MAIN_URL}/sign-in`);

  const [forums, totalForums] = await db.$transaction([
    db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      select: {
        subForum: {
          select: {
            id: true,
            banner: true,
            title: true,
            slug: true,
            _count: {
              select: {
                subscriptions: true,
              },
            },
          },
        },
      },
    }),
    db.subscription.count({
      where: {
        userId: session.user.id,
      },
    }),
  ]);

  return (
    <>
      <section className="fixed md:relative top-0 lg:top-0 p-2 w-full lg:w-4/6 max-h-[calc(100%-4.25rem)] md:max-h-full bg-primary-foreground overflow-y-auto hide_scrollbar">
        <h1 className="text-2xl font-semibold">Cộng đồng đang theo dõi</h1>

        {!forums.length && <p>Không có kết quả</p>}

        <div className="mt-3 space-y-6">
          <ul className="space-y-4">
            {forums.map(({ subForum: forum }) => (
              <li key={forum.id}>
                <Link
                  href={`/m/${forum.slug}`}
                  className="grid grid-cols-[.3fr_1fr] gap-3 transition-colors rounded-md hover:bg-muted"
                >
                  <ForumImage forum={forum} sizes="25vw" />
                  <div>
                    <p className="text-2xl font-semibold line-clamp-2 lg:line-clamp-3">
                      {forum.title}
                    </p>
                    <dl className="flex items-center gap-1.5">
                      <dt>{forum._count.subscriptions}</dt>
                      <dd>Thành viên</dd>
                    </dl>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <PaginationControll route="/follows?" total={totalForums} />
        </div>
      </section>
      <Homepage />
    </>
  );
};

export default page;
