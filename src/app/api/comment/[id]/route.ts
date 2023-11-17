import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const CommentValidator = z.object({
  limit: z.string(),
  cursor: z.string().nullish().optional(),
});

const getComments = ({
  cursor,
  limit,
  postId,
}: {
  cursor?: number;
  limit: number;
  postId: number;
}) => {
  let paginationProps: Prisma.PostCommentFindManyArgs = {};
  if (!!cursor) {
    paginationProps.skip = 1;
    paginationProps.cursor = {
      id: cursor,
    };
  }

  return db.postComment.findMany({
    where: {
      postId,
      replyToId: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    select: {
      id: true,
      content: true,
      oEmbed: true,
      createdAt: true,
      votes: true,
      creatorId: true,
      creator: {
        select: {
          name: true,
          color: true,
          image: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    ...paginationProps,
  });
};

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const url = new URL(req.url);

    const { cursor: userCursor, limit } = CommentValidator.parse({
      limit: url.searchParams.get('limit'),
      cursor: url.searchParams.get('cursor'),
    });

    const cursor = userCursor ? parseInt(userCursor) : undefined;

    const comments = await getComments({
      cursor,
      limit: parseInt(limit),
      postId: +context.params.id,
    });

    return new Response(
      JSON.stringify({
        comments,
        lastCursor:
          comments.length === parseInt(limit)
            ? comments[comments.length - 1].id
            : undefined,
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    await db.$transaction([
      db.postComment.findUniqueOrThrow({
        where: {
          creatorId: session.user.id,
          id: +context.params.id,
        },
      }),
      db.postComment.delete({
        where: {
          id: +context.params.id,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
