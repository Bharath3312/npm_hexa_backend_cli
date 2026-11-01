import { logger } from '../config/logger.js';
import { deleteFile } from '../config/multer.js';

export async function cleanupUploadedFiles(req) {
  try {
    const filesToDelete = [];

    // single — req.file
    if (req.file) {
      filesToDelete.push(req.file.key);
    }

    // array — req.files is an array
    if (Array.isArray(req.files)) {
      req.files.forEach((file) => {
        filesToDelete.push(file.key);
      });
    }

    // fields — req.files is an object of arrays
    if (req.files && !Array.isArray(req.files) && typeof req.files === 'object') {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file) => {
          filesToDelete.push(file.key);
        });
      });
    }

    if (filesToDelete.length === 0) return;
    // console.log(filesToDelete, 'filesToDelete----------------------');

    // delete all in parallel
    await Promise.allSettled(
      filesToDelete.map(async (key) => {
        await deleteFile(key);
        logger.info('Cleaned up orphaned upload', { key });
      }),
    );
  } catch (err) {
    logger.warn('Failed to cleanup uploads', { err });
  }
}
