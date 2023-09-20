import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Cộng đồng đang theo dõi',
  description: 'Cộng đồng bạn đang theo dõi | Moetruyen',
  alternates: {
    canonical: `${process.env.NEXTAUTH_URL}/followed-forum`,
  },
  keywords: ['Follow', 'Forum', 'Moetruyen'],
  openGraph: {
    siteName: 'Moetruyen Forum',
    url: `${process.env.NEXTAUTH_URL}/followed-forum`,
    title: 'Cộng đồng đang theo dõi',
    description: 'Cộng đồng bạn đang theo dõi | Moetruyen',
  },
  twitter: {
    site: 'Moetruyen Forum',
    title: 'Cộng đồng đang theo dõi',
    description: 'Cộng đồng bạn đang theo dõi | Moetruyen',
  },
};

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/');

  const subForums = await db.user
    .findUnique({
      where: {
        id: session.user.id,
      },
    })
    .subscription({
      select: {
        subForum: {
          select: {
            slug: true,
            title: true,
            banner: true,
            _count: {
              select: {
                subscriptions: true,
              },
            },
          },
        },
      },
    });
  if (!subForums) return notFound();

  return (
    <main className="container lg:w-4/5 px-0">
      {!!subForums.length ? (
        <section className="space-y-4">
          <h1 className="text-lg font-semibold">
            Cộng đồng mà bạn đang theo dõi
          </h1>
          <div className="grid grid-cols-2 gap-4 rounded-md dark:bg-zinc-900/60">
            {subForums.map((sub) => (
              <Link
                key={sub.subForum.slug}
                href={`/${sub.subForum.slug}`}
                className="grid grid-cols-[.3fr_1fr] gap-4 p-2 rounded-md transition-colors hover:dark:bg-zinc-900"
              >
                {!!sub.subForum.banner && (
                  <div className="relative aspect-video">
                    <Image
                      fill
                      sizes="(max-width: 640px) 30vw, 20vw"
                      quality={40}
                      src={sub.subForum.banner}
                      alt={`${sub.subForum.title} Banner`}
                      className="object-cover rounded-md"
                    />
                  </div>
                )}

                <dl>
                  <dt className="text-lg font-semibold">
                    {sub.subForum.title}
                  </dt>
                  <dd>{sub.subForum._count.subscriptions} Members</dd>
                </dl>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <p>Bạn chưa theo dõi Forum nào</p>
      )}
    </main>
  );
};

export default page;
