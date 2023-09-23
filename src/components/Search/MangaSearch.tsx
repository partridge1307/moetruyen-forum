import { mainURL } from '@/config';
import type { Manga, MangaAuthor } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';
import { SheetClose } from '../ui/Sheet';

interface MangaSearchProps {
  mangas?: (Pick<Manga, 'id' | 'slug' | 'image' | 'name' | 'review'> & {
    author: Pick<MangaAuthor, 'name'>[];
  })[];
}

const MangaSearch: FC<MangaSearchProps> = ({ mangas }) => {
  return !!mangas?.length ? (
    <div className="space-y-4">
      {mangas.map((manga) => (
        <a
          target="_blank"
          key={manga.id}
          href={`${mainURL}/manga/${manga.slug}`}
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

            <div>
              <h1 className="text-lg lg:text-xl font-semibold">{manga.name}</h1>
              <p className="line-clamp-1">
                {manga.author.map((author) => author.name).join(', ')}
              </p>
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
