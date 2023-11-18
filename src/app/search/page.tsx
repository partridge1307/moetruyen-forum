import Search from '@/components/Search';
import dynamic from 'next/dynamic';

const Homepage = dynamic(() => import('@/components/Sidebar/Homepage'));

const page = () => {
  return (
    <>
      <section className="relative w-full lg:w-4/6 p-3 max-sm:pb-20 bg-primary-foreground">
        <Search />
      </section>
      <Homepage />
    </>
  );
};

export default page;
