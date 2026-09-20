import { ApiError } from '../utils/apiError.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = source === 'body' ? req.body
      : source === 'params' ? req.params
      : source === 'query' ? req.query
      : req.body;

    const result = schema.safeParse(data);    
    if (!result.success) {
      const { fieldErrors, formErrors } = result.error.flatten();

      const errors = Object.entries(fieldErrors).map(([field, messages]) => ({
        field,
        message: messages[0], // first error per field
      }));

      // my approach — ApiError integrates with your errorHandler
      return next(
        ApiError.badRequest(
          'Validation failed',
          errors.length > 0 ? errors : formErrors
        )
      );
    }

    // replace with sanitized data
    // if (source === 'body') req.body = result.data;
    // if (source === 'params') req.params = result.data;
    // if (source === 'query') req.query = result.data;

    next();
  };
}

// validate multiple sources at once
export function validateAll({ body, params, query }) {
  return (req, res, next) => {
    const errors = [];

    if (body) {
      const result = body.safeParse(req.body);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          errors.push({ field: `body.${field}`, message: messages[0] });
        });
      } else {
        req.body = result.data;
      }
    }

    if (params) {
      const result = params.safeParse(req.params);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          errors.push({ field: `params.${field}`, message: messages[0] });
        });
      } else {
        req.params = result.data;
      }
    }

    if (query) {
      const result = query.safeParse(req.query);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          errors.push({ field: `query.${field}`, message: messages[0] });
        });
      } else {
        req.query = result.data;
      }
    }

    if (errors.length > 0) {
      return next(ApiError.badRequest('Validation failed', errors));
    }

    next();
  };
}