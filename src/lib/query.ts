import { generateSearchPhrase } from './utils';
import { db } from '@/lib/db';

export type SearchMangaResult = {
  id: number;
  slug: string;
  name: string;
  image: string;
  review: string;
};
export const searchManga = ({
  searchPhrase,
  take,
  skip = 0,
}: {
  searchPhrase: string;
  take: number;
  skip?: number;
}): Promise<SearchMangaResult[]> => {
  const query = generateSearchPhrase(searchPhrase);

  return db.$queryRaw`SELECT "id", "slug", "name", "image", "review" FROM "Manga" WHERE to_tsvector('english', "name") @@ to_tsquery(${query}) AND "isPublished" = true LIMIT ${take} OFFSET ${skip}`;
};

export type SearchUserResult = {
  name: string;
  image: string;
  color: string;
};
export const searchUser = ({
  searchPhrase,
  take,
  skip = 0,
}: {
  searchPhrase: string;
  take: number;
  skip?: number;
}): Promise<SearchUserResult[]> => {
  const query = generateSearchPhrase(searchPhrase);

  return db.$queryRaw`SELECT "name", "image", "color" FROM "User" WHERE to_tsvector('english', "name") @@ to_tsquery(${query}) LIMIT ${take} OFFSET ${skip}`;
};

export type SearchForumResult = {
  slug: string;
  banner: string;
  title: string;
};
export const searchForum = ({
  searchPhrase,
  take,
  skip = 0,
}: {
  searchPhrase: string;
  take: number;
  skip?: number;
}): Promise<SearchForumResult[]> => {
  const query = generateSearchPhrase(searchPhrase);

  return db.$queryRaw`SELECT "slug", "banner", "title" FROM "SubForum" WHERE to_tsvector('english', "title") @@ to_tsquery(${query}) LIMIT ${take} OFFSET ${skip}`;
};

export type SearchPostResult = {
  id: string;
  title: string;
  slug: string;
  plainTextContent: string;
};

export const SearchPost = ({
  searchPhrase,
  forumId,
  take,
}: {
  searchPhrase: string;
  forumId: number;
  take: number;
}): Promise<SearchPostResult[]> => {
  const query = generateSearchPhrase(searchPhrase);

  return db.$queryRaw`SELECT p."id", p."title", f."slug", p."plainTextContent" FROM "Post" AS p INNER JOIN "SubForum" AS f ON p."subForumId" = f."id" WHERE f."id" = ${forumId} AND to_tsvector('english', p."plainTextContent") @@ to_tsquery(${query}) LIMIT ${take}`;
};
