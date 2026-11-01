import crypto from 'node:crypto';
import { AuthSession } from '../models/index.model.js';
import { BaseRepository } from './base.repo.js';

class SessionRepositoy extends BaseRepository {
  // constructor() {
  //   super(RefreshToken);
  // }
  hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

  store(userId, refreshToken, deviceInfo, expiredDays) {
    const tokenHash = this.hashToken(refreshToken);
    return this.model.create({
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + expiredDays * 24 * 60 * 60 * 1000),
      ip: deviceInfo.ip,
      userAgent: deviceInfo.userAgent,
      device: deviceInfo.device,
    });
  }

  isValidRefresh(refreshToken) {
    const tokenHash = this.hashToken(refreshToken);
    return this.model.findOne({ tokenHash, expiresAt: { $gt: new Date() }, revoked: false });
  }

  findAllSessions(userId) {
    return this.model.findMany({ userId, revoked: false, expiresAt: { gt: new Date() } });
  }

  revokeByRefresh(userId, refreshToken) {
    const tokenHash = this.hashToken(refreshToken);
    return this.model.updateOne({ tokenHash, userId }, { revoked: true });
  }

  revokeBySessionId(userId, sessionId) {
    return this.model.updateMany({ _id: sessionId, userId }, { revoked: true });
  }
  revokeAllForUser(userId) {
    return this.model.updateMany({ userId }, { revoked: true });
  }
}

export const sessionRepository = new SessionRepositoy(AuthSession);
