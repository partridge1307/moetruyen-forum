import { FC } from 'react';
import dynamic from 'next/dynamic';

const ThreadWidget = dynamic(() => import('@/components/Sidebar/Thread'));

interface layoutProps {
  children: React.ReactNode;
  params: {
    slug: string;
  };
}

const layout: FC<layoutProps> = ({ children, params }) => {
  return (
    <>
      <section className="fixed md:relative top-12 lg:top-0 w-full lg:w-4/6 p-3 max-h-[calc(100%-7.25rem)] md:max-h-[calc(100%-3rem)] lg:max-h-full bg-primary-foreground overflow-y-auto hide_scrollbar">
        {children}
      </section>
      <ThreadWidget slug={params.slug} />
    </>
  );
};

export default layout;
