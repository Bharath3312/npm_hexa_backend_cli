import { sessionRepository } from '../repositories/token.repository.js';
import { ApiError } from '../utils/apiError.js';

import {
  generateAccessToken,
  generateRefreshToken,
  generateTempToken,
  verifyRefreshToken,
} from '../utils/token.utils.js';

export const authService = {

  async logout(userId, refreshToken) {
    await sessionRepository.revokeByRefresh(userId, refreshToken);
  },
  async refresh(refreshToken, _deviceInfo) {
    if (!refreshToken) throw new ApiError(401, 'Refresh token required');

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const stored = await sessionRepository.isValidRefresh(refreshToken);
    if (!stored) throw new ApiError(401, 'Refresh token revoked or not found');

    // rotate: invalidate old, issue new (prevents reuse attacks)
    // await sessionRepository.revokeByRefresh(refreshToken);

    const payload = { userId: decoded.userId, name: decoded.name };
    const newAccessToken = generateAccessToken(payload);
    // const newRefreshToken = generateRefreshToken(payload);
    // await sessionRepository.store(decoded.userId, newRefreshToken,deviceInfo);

    return { accessToken: newAccessToken };
  },
  async getActiveSessions(userId) {
    return await sessionRepository.findAllSessions({ userId });
  },
  async revokeById(sessionId, userId) {
    return await sessionRepository.revokeBySessionId(sessionId, userId);
  },
  async revokeAllSessions(userId) {
    return await sessionRepository.revokeAllForUser(userId);
  },
};
