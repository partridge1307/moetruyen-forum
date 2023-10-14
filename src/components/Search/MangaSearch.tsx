import type { Manga } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';
import { SheetClose } from '../ui/Sheet';

interface MangaSearchProps {
  mangas?: Pick<Manga, 'id' | 'slug' | 'image' | 'name' | 'review'>[];
}

const MangaSearch: FC<MangaSearchProps> = ({ mangas }) => {
  return !!mangas?.length ? (
    <div className="space-y-4">
      {mangas.map((manga) => (
        <a
          target="_blank"
          key={manga.id}
          href={`${process.env.NEXT_PUBLIC_MAIN_URL}/manga/${manga.slug}`}
        >
          <SheetClose className="w-full text-start grid grid-cols-[.5fr_1fr] lg:grid-cols-[.1fr_1fr] gap-4 p-2 rounded-md transition-colors hover:dark:bg-zinc-800">
            <div className="relative" style={{ aspectRatio: 4 / 3 }}>
              <Image
                fill
                sizes="(max-width: 640px) 25vw, 30vw"
                quality={40}
                src={manga.image}
                alt={`${manga.name} Thumbnail`}
                className="object-cover rounded-md"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-lg lg:text-xl font-semibold">{manga.name}</p>
              <p className="line-clamp-2">{manga.review}</p>
            </div>
          </SheetClose>
        </a>
      ))}
    </div>
  ) : (
    <p>Không có kết quả</p>
  );
};

export default MangaSearch;
