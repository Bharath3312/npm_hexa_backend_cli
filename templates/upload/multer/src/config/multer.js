import crypto from 'node:crypto';
import path from 'node:path';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { env } from './env.js';

const s3 = new S3Client({
  endpoint: env.bucket_endpoint,
  region: env.bucket_region,

  credentials: {
    accessKeyId: env.bucket_accessId,
    secretAccessKey: env.bucket_secretKey,
  },
});

export async function deleteFile(key) {
  if (!key) return;
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.bucket_name,
      Key: key,
    }),
  );
}

export const createUploader = ({
  folder,
  allowedMimeTypes,
  maxFileSizeMB = 5,
  isPublic = false,
}) => {
  return multer({
    storage: multerS3({
      s3,
      bucket: env.bucket_name,

      ...(isPublic && {
        acl: 'public-read',
      }),

      key: (_eq, file, cb) => {
        const ext = path.extname(file.originalname);

        const fileName = `${crypto.randomUUID()}${ext}`;

        cb(null, `uploads/${folder}/${fileName}`);
      },
    }),

    fileFilter: (_req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type'), false);
      }

      cb(null, true);
    },

    limits: {
      fileSize: maxFileSizeMB * 1024 * 1024,
    },
  });
};
