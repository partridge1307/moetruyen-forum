import type { Prisma } from '@prisma/client';
import { FC, memo } from 'react';

interface CommentOEmbedProps {
  oEmbed: Prisma.JsonValue;
}

const CommentOEmbed: FC<CommentOEmbedProps> = ({ oEmbed }) => {
  const { link, meta } = oEmbed as {
    link: string;
    meta: {
      title?: string;
      description?: string;
      image: {
        url?: string;
      };
    };
  };
  const url = new URL(link);

  return (
    <a
      href={link}
      target="_blank"
      className="flex items-center rounded-lg bg-muted"
    >
      {meta.image.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          width={96}
          height={96}
          loading="lazy"
          src={meta.image.url}
          alt={`${url.hostname} Image`}
          className="w-24 h-24 rounded-l-lg object-cover"
        />
      )}

      <div className="flex flex-col overflow-clip space-y-1 max-w-sm md:max-w-md lg:max-w-lg px-3 md:px-4">
        <p className="moetruyen-editor-link line-clamp-1">{url.host}</p>

        <dl>
          {!!meta.title && (
            <dt className="line-clamp-2 font-semibold">{meta.title}</dt>
          )}

          {!!meta.description && (
            <dd className="text-xs md:text-sm line-clamp-2">
              {meta.description}
            </dd>
          )}
        </dl>
      </div>
    </a>
  );
};

export default memo(CommentOEmbed);
