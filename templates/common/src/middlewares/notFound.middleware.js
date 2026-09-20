import { ApiError } from '../utils/apiError.js';

// catches any request that didn't match a route
export function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.url}`));
}