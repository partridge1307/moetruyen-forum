import Search from '@/components/Search';
import dynamic from 'next/dynamic';

const Homepage = dynamic(() => import('@/components/Sidebar/Homepage'));

const page = () => {
  return (
    <>
      <section className="fixed md:relative top-0 lg:top-0 p-2 w-full lg:w-4/6 max-h-[calc(100%-4.25rem)] md:max-h-full bg-primary-foreground overflow-y-auto hide_scrollbar">
        <Search />
      </section>
      <Homepage />
    </>
  );
};

export default page;
