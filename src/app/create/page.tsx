import { getAuthSession } from '@/lib/auth';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';

const CreateThreadForm = dynamic(() => import('@/components/Create/Thread'));

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
