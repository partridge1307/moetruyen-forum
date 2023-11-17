import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreateCommentValidator } from '@/lib/validators/comment';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { type, id, content, oEmbed } = CreateCommentValidator.parse(
      await req.json()
    );

    let createdComment;
    if (type === 'SUB_COMMENT') {
      const targetComment = await db.postComment.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          id: true,
          postId: true,
          creatorId: true,
          post: {
            select: {
              subForum: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      });

      [createdComment] = await db.$transaction([
        db.postComment.create({
          data: {
            replyToId: targetComment.id,
            postId: targetComment.postId,
            creatorId: session.user.id,
            content: { ...content },
            oEmbed,
          },
        }),
        ...(session.user.id !== targetComment.creatorId
          ? [
              db.notify.create({
                data: {
                  type: 'GENERAL',
                  toUserId: targetComment.creatorId,
                  content: `${session.user.name} vừa phản hồi bình luận của bạn`,
                  endPoint: `${process.env.NEXTAUTH_URL}/m/${targetComment.post.subForum.slug}/${targetComment.postId}`,
                },
              }),
            ]
          : []),
      ]);
    } else {
      createdComment = await db.postComment.create({
        data: {
          postId: id,
          creatorId: session.user.id,
          content: { ...content },
          oEmbed,
        },
      });
    }

    return new Response(JSON.stringify(createdComment.id));
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
