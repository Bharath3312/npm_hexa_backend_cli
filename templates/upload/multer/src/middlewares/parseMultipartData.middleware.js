export const parseMultipartData = (req, _res, next) => {
  try {
    req.body = parseObject(req.body);
    // console.log(req.body, 'parseMultiPartData');

    next();
  } catch (error) {
    next(error);
  }
};

function parseValue(value) {
  if (typeof value !== 'string') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!Number.isNaN(value) && value.trim() !== '') return Number(value);
  if (
    (value.startsWith('{') && value.endsWith('}')) ||
    (value.startsWith('[') && value.endsWith(']'))
  ) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function parseObject(obj) {
  if (Array.isArray(obj)) return obj.map(parseValue);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [
        key,
        typeof val === 'object' ? parseObject(val) : parseValue(val),
      ]),
    );
  }
  return parseValue(obj);
}
