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
      <section className="relative top-0 w-full lg:w-4/6 max-sm:pt-20 max-sm:pb-20 p-6 bg-primary-foreground">
        {children}
      </section>
      <ThreadWidget slug={params.slug} />
    </>
  );
};

export default layout;
