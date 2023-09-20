'use client';

import { Button, buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { usePagination } from '@mantine/hooks';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FC } from 'react';

interface PaginationControllProps {
  total: number;
  route: string;
}

const PaginationControll: FC<PaginationControllProps> = ({ total, route }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '10');

  const pagigation = usePagination({
    total: Math.ceil(total / limit),
    page: page,
  });

  return (
    <section className="flex flex-wrap justify-center items-center gap-4">
      <Button
        size={'sm'}
        className="px-2"
        disabled={!(page - 1 > 0)}
        onClick={() => router.push(`${route}&limit=${limit}&page=${page - 1}`)}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      {pagigation.range.map((range, idx) => {
        if (range == 'dots') return <span key={idx}>...</span>;
        else
          return (
            <Link
              key={idx}
              href={`${route}&limit=${limit}&page=${range}`}
              className={cn(
                buttonVariants({ size: 'sm', variant: 'ghost' }),
                'hover:bg-orange-500/90',
                {
                  'bg-orange-500': range === pagigation.active,
                }
              )}
            >
              {range}
            </Link>
          );
      })}

      <Button
        size={'sm'}
        className="px-2"
        disabled={!((page - 1) * limit + limit < total)}
        onClick={() => router.push(`${route}&limit=${limit}&page=${page + 1}`)}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </section>
  );
};

export default PaginationControll;
