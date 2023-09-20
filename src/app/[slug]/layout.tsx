import { FC } from 'react';

interface layoutProps {
  children: React.ReactNode;
  threadInfo: React.ReactNode;
}

const layout: FC<layoutProps> = ({ children, threadInfo }) => {
  return (
    <main className="container max-sm:px-2 grid grid-cols-1 lg:grid-cols-[1fr_.45fr] gap-6 mb-10">
      <section className="flex flex-col gap-y-6">{children}</section>

      {threadInfo}
    </main>
  );
};

export default layout;
