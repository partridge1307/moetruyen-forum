import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';

const PostValidator = z.object({
  limit: z.string(),
  cursor: z.string().nullish().optional(),
  sortBy: z.enum(['asc', 'desc', 'hot']),
});

const getPosts = async ({
  cursor,
  forumId,
  orderBy,
  limit,
}: {
  cursor?: number;
  forumId: number;
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

  return db.post.findMany({
    where: {
      subForumId: forumId,
    },
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

export async function GET(req: Request, context: { params: { id: string } }) {
  const url = new URL(req.url);

  try {
    const {
      limit,
      cursor: userCursor,
      sortBy,
    } = PostValidator.parse({
      limit: url.searchParams.get('limit'),
      cursor: url.searchParams.get('cursor'),
      sortBy: url.searchParams.get('sortBy'),
    });

    const orderBy: Prisma.PostOrderByWithRelationAndSearchRelevanceInput =
      sortBy === 'hot' ? { votes: { _count: 'desc' } } : { createdAt: sortBy };

    const cursor = userCursor ? parseInt(userCursor) : undefined;
    const posts = await getPosts({
      cursor,
      forumId: +context.params.id,
      limit: parseInt(limit),
      orderBy,
    });

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
