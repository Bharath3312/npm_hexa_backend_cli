import { ApiError } from '../utils/apiError.js';
import { verifyAccessToken, verifyTempToken } from '../utils/token.utils.js';

export const requireAuth = (req, _res, next) => {
  const publicKeys = ['forgot_password', 'email_verification', 'change_email_new', 'Register'];
  const path = req.path ?? req.route?.path;
  const key = req.query?.key || req.body?.key;
  let tfa = false;
  if (
    (path === '/requestGoogleAuthentication' ||
      path === '/userTwofaDetails' ||
      path === '/verifyGoogleAuthentication' ||
      path === '/requestMailAuthentication' ||
      path === '/verifyMailAuthentication' ||
      path === '/twofaLostingRequest' ||
      path === '/twofaLostImage') &&
    key === 'login-two-factor'
  ) {
    tfa = true;
  } else if (
    (req.path === '/send-otp' || req.path === '/verify_mail') &&
    publicKeys.includes(req.body?.key)
  ) {
    return next();
  }
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // "Bearer <token>"

  if (!token) throw ApiError.unauthorized('Invalid or expired access token');

  try {
    let decoded = null;
    if (tfa) {
      decoded = verifyTempToken(token);
    } else {
      decoded = verifyAccessToken(token);
    }
    req.user = decoded;
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
};
