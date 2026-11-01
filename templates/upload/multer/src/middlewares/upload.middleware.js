import { createUploader } from '../config/multer.js';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const DOCUMENT_TYPES = [...IMAGE_TYPES, 'application/pdf'];

export const profileUpload = createUploader({
  folder: 'profile',
  allowedMimeTypes: IMAGE_TYPES,
  maxFileSizeMB: 2,
});

export const exchangeUpload = createUploader({
  folder: 'exchange',
  allowedMimeTypes: IMAGE_TYPES,
  maxFileSizeMB: 2,
  isPublic: true,
});

export const kycUpload = createUploader({
  folder: 'kyc',
  allowedMimeTypes: DOCUMENT_TYPES,
  maxFileSizeMB: 5,
});
