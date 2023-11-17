import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';

const PostValidator = z.object({
  tab: z.enum(['FOLLOW', 'GENERAL']),
  limit: z.string(),
  cursor: z.string().nullish().optional(),
  sortBy: z.enum(['asc', 'desc', 'hot']),
});

const getPosts = async ({
  tab,
  cursor,
  orderBy,
  limit,
}: {
  tab: 'FOLLOW' | 'GENERAL';
  cursor?: number;
  limit: number;
  orderBy: Prisma.PostOrderByWithRelationAndSearchRelevanceInput;
}) => {
  const paginationProps: Prisma.PostFindManyArgs = {};

  if (!!cursor) {
    paginationProps.skip = 1;
    paginationProps.cursor = {
      id: cursor,
    };
  }

  if (tab === 'FOLLOW') {
    const session = await getAuthSession();
    if (!session) return null;

    paginationProps.where = {
      subForum: {
        OR: [
          {
            subscriptions: {
              some: {
                userId: session.user.id,
              },
            },
          },
          {
            creatorId: session.user.id,
          },
        ],
      },
    };
  }

  return db.post.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      votes: true,
      subForum: {
        select: {
          title: true,
          slug: true,
        },
      },
      author: {
        select: {
          name: true,
          color: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy,
    take: limit,
    ...paginationProps,
  });
};

export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    const {
      tab,
      limit,
      cursor: userCursor,
      sortBy,
    } = PostValidator.parse({
      tab: url.searchParams.get('tab'),
      limit: url.searchParams.get('limit'),
      cursor: url.searchParams.get('cursor'),
      sortBy: url.searchParams.get('sortBy'),
    });

    const orderBy: Prisma.PostOrderByWithRelationAndSearchRelevanceInput =
      sortBy === 'hot' ? { votes: { _count: 'desc' } } : { createdAt: sortBy };

    const cursor = userCursor ? parseInt(userCursor) : undefined;
    const posts = await getPosts({
      tab,
      cursor,
      limit: parseInt(limit),
      orderBy,
    });
    if (!posts) return new Response('Not found', { status: 404 });

    return new Response(
      JSON.stringify({
        posts,
        lastCursor:
          posts.length === parseInt(limit)
            ? posts[posts.length - 1].id
            : undefined,
      })
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
