import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { contabo } from '../client';
import { generateKey, resizeImage, sendCommand } from '../utils';

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

  await sendCommand(() =>
    contabo.send(
      new PutObjectCommand({
        Body: optimizedImage,
        Bucket: process.env.CB_BUCKET,
        Key: `forum/${subForumId}/thumbnail.png`,
      })
    )
  );

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/forum/${subForumId}/thumbnail.png`,
    prevImage
  );
  return Key;
};

const DeleteSubForumImage = async (subForumId: number) => {
  return await sendCommand(() =>
    contabo.send(
      new DeleteObjectCommand({
        Bucket: process.env.CB_BUCKET,
        Key: `forum/${subForumId}/thumbnail.png`,
      })
    )
  );
};

export { DeleteSubForumImage, UploadForumImage };
