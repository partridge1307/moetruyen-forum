import ThreadCreateSkeleton from '@/components/Skeleton/ThreadCreateSkeleton';
import { getAuthSession } from '@/lib/auth';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

const Homepage = dynamic(() => import('@/components/Sidebar/Homepage'));

const CreateThreadForm = dynamic(() => import('@/components/Create/Thread'), {
  ssr: false,
  loading: () => <ThreadCreateSkeleton />,
});

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/');

  return (
    <>
      <section className="relative p-3 my-2 w-full lg:w-4/6 max-h-full overflow-y-auto hide_scrollbar">
        <CreateThreadForm />
      </section>
      <Homepage />
    </>
  );
};

export default page;

export const metadata: Metadata = {
  title: {
    default: 'Tạo cộng đồng',
    absolute: 'Tạo cộng đồng',
  },
  description: 'Tạo cộng đồng | Moetruyen',
  alternates: {
    canonical: `${process.env.NEXTAUTH_URL}/create`,
  },
  keywords: ['Create', 'Forum', 'Tạo', 'Cộng đồng', 'Moetruyen'],
  openGraph: {
    title: 'Tạo cộng đồng',
    description: 'Tạo cộng đồng | Moetruyen',
    siteName: 'Moetruyen Forum',
    url: `${process.env.NEXTAUTH_URL}/create`,
  },
  twitter: {
    title: 'Tạo cộng đồng',
    description: 'Tạo cộng đồng | Moetruyen',
    site: 'Moetruyen Forum',
  },
};
