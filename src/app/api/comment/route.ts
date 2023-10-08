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
              id: true,
              subForum: {
                select: { slug: true },
              },
            },
          },
        },
      });

      if (targetComment.creatorId !== session.user.id) {
        [createdComment] = await db.$transaction([
          db.postComment.create({
            data: {
              postId: targetComment.postId,
              replyToId: targetComment.id,
              creatorId: session.user.id,
              content: { ...content },
              oEmbed,
            },
          }),
          db.notify.create({
            data: {
              type: 'GENERAL',
              toUserId: targetComment.creatorId,
              content: `${session.user.name} vừa phản hồi bình luận của bạn trong Forum`,
              endPoint: `${process.env.NEXTAUTH_URL}/${targetComment.post.subForum.slug}/${targetComment.postId}`,
            },
          }),
        ]);
      } else {
        createdComment = await db.postComment.create({
          data: {
            postId: targetComment.postId,
            replyToId: targetComment.id,
            creatorId: session.user.id,
            content: { ...content },
            oEmbed,
          },
        });
      }
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
