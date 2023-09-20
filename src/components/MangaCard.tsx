import { formatTimeToNow } from '@/lib/utils';
import type { Manga, MangaAuthor } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface MangaCardProps {
  manga: Pick<
    Manga,
    'id' | 'slug' | 'name' | 'image' | 'review' | 'createdAt'
  > & {
    author: Pick<MangaAuthor, 'name'>[];
    _count: {
      chapter: number;
    };
  };
}

const MangaCard: FC<MangaCardProps> = ({ manga }) => {
  return (
    <Link
      scroll={false}
      href={manga.slug}
      className="grid grid-cols-[.6fr_1fr] lg:grid-cols-[.3fr_1fr] gap-4 p-2 rounded-md transition-colors dark:bg-zinc-900 hover:dark:bg-zinc-900/80"
    >
      <div className="relative" style={{ aspectRatio: 4 / 3 }}>
        <Image
          fill
          sizes="(max-width: 640px): 25vw, 30vw"
          quality={40}
          priority
          src={manga.image}
          alt={`${manga.name} Thumbnail`}
          className="object-cover rounded-md"
        />
      </div>

      <div className="space-y-2">
        <h1 className="text-lg lg:text-xl font-semibold line-clamp-2">
          {manga.name}
        </h1>

        <div>
          <p className="text-sm">
            {manga.author.map((author) => author.name).join(', ')}
          </p>

          <dl className="flex items-center gap-4">
            <dt className="text-sm">{manga._count.chapter} Chapter</dt>
            <dd>
              <time
                dateTime={new Date(manga.createdAt).toDateString()}
                className="text-sm"
              >
                {formatTimeToNow(new Date(manga.createdAt))}
              </time>
            </dd>
          </dl>
        </div>

        <p className="text-sm max-sm:line-clamp-3">{manga.review}</p>
      </div>
    </Link>
  );
};

export default MangaCard;
