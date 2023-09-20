import ThreadCreateSkeleton from '@/components/Skeleton/ThreadCreateSkeleton';
import { getAuthSession } from '@/lib/auth';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

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

const CreateThreadForm = dynamic(() => import('@/components/Create/Thread'), {
  ssr: false,
  loading: () => <ThreadCreateSkeleton />,
});

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/');

  return (
    <main className="containter mx-auto lg:w-2/3 p-3 mb-10 rounded-md dark:bg-zinc-900/60">
      <CreateThreadForm />
    </main>
  );
};

export default page;
