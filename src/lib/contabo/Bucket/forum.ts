import sharp from 'sharp';
import { generateKey, resizeImage, sendCommand } from '../utils';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { contabo } from '../client';

const UploadForumImage = async (
  image: File,
  subForumId: number,
  prevImage: string | null
) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  const sharpImage = sharp(arrayBuffer).toFormat('png').png({ quality: 40 });

  const { width, height } = await sharpImage.metadata();

  const optimizedImage = await resizeImage(
    sharpImage,
    width,
    height
  ).toBuffer();

  const command = new PutObjectCommand({
    Body: optimizedImage,
    Bucket: 'forum',
    Key: `${subForumId}/thumbnail.png`,
  });

  await sendCommand(contabo, command, 5);

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/forum/${subForumId}/thumbnail.png`,
    prevImage
  );
  return Key;
};

const DeleteSubForumImage = async (subForumId: number) => {
  const command = new DeleteObjectCommand({
    Bucket: 'forum',
    Key: `${subForumId}/thumbnail.png`,
  });

  return await sendCommand(contabo, command, 5);
};

export { UploadForumImage, DeleteSubForumImage };
