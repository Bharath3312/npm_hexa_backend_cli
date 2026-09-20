import { logger } from '../config/logger.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';
import { cleanupUploadedFiles } from '../utils/upload.cleanup.js';

export function errorHandler(err, req, res, next) {
//  console.log('errorHandler called', {
//     time: new Date(),
//     message: err.message,
//     url: req.url,
//     method: req.method,
//     stack: err.stack,
//   });    
  // ── 1. normalize the error ───────────────────────
  
    if (!req.uploadSaved) {
       void cleanupUploadedFiles(req);
    }

  
  let error = err;

  // convert plain Error to ApiError
  if (!(error instanceof ApiError)) {
    // Better Auth errors come with a status field
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal server error';
    error = new ApiError(statusCode, message);
    error.isOperational = false; // unexpected error
  }

  // ── 2. log it ────────────────────────────────────
  console.log(error.statusCode ,"--------------------------------------------------------------");
  
  if (error.statusCode >= 500) {
    // 500s are real problems — log full error with stack
    logger.error({
      err: {
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
      },
      req: {
        method: req.method,
        url: req.url,
        ip: req.ip,
      },
    }, 'Server error');
  } 
//   else if (error.statusCode >= 400) {
//     // 400s are client mistakes — log as warn, no stack needed
//     logger.warn({
//       statusCode: error.statusCode,
//       message: error.message,
//       url: req.url,
//       method: req.method,
//     }, 'Client error');
//   }

  // ── 3. send response ─────────────────────────────
  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors.length > 0 && { errors: error.errors }),
    // only show stack trace in development
    ...(env.nodeEnv === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
}