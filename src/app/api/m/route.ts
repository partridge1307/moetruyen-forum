import { getAuthSession } from '@/lib/auth';
import { UploadForumImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { normalizeText } from '@/lib/utils';
import { CreateThreadFormValidator } from '@/lib/validators/forum';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { slug, thumbnail, title, canSend } = CreateThreadFormValidator.parse(
      await req.formData()
    );

    if (
      slug &&
      (await db.subForum.findUnique({
        where: { slug },
      }))
    ) {
      return new Response('Existing slug', { status: 400 });
    }

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      select: {
        verified: true,
        createdAt: true,
        _count: {
          select: {
            manga: true,
          },
        },
      },
    });

    const createdAt = user.createdAt;
    createdAt.setDate(createdAt.getDate() + 7);

    if (
      createdAt.getTime() >= new Date().getTime() ||
      !user.verified ||
      user._count.manga < 3
    ) {
      return new Response('Not enough condition', {
        status: 409,
      });
    }

    const createdSubForum = await db.subForum.create({
      data: {
        slug: randomUUID(),
        title,
        creatorId: session.user.id,
        canSend: canSend === 'true' ? true : false,
      },
    });

    const subForumSlug =
      slug?.trim() ??
      `${normalizeText(createdSubForum.title)
        .toLowerCase()
        .split(' ')
        .join('-')}-${createdSubForum.id}`;

    if (thumbnail) {
      const image =
        thumbnail instanceof File
          ? await UploadForumImage(thumbnail, createdSubForum.id, null)
          : thumbnail;

      await db.subForum.update({
        where: {
          id: createdSubForum.id,
        },
        data: {
          banner: image,
          slug: subForumSlug,
        },
      });
    } else {
      await db.subForum.update({
        where: {
          id: createdSubForum.id,
        },
        data: {
          slug: subForumSlug,
        },
      });
    }

    return new Response(JSON.stringify(subForumSlug));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        return new Response('Existed sub forum', { status: 406 });
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
