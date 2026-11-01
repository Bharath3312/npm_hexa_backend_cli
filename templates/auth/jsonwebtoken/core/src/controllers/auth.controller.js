import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getDeviceInfo } from '../utils/device.utils.js';

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export const authController = {

  refresh: asyncHandler(async (req, res) => {
    const refreshToken = req.headers?.refreshtoken;
    const deviceInfo = getDeviceInfo(req);
    const { accessToken } = await authService.refresh(refreshToken, deviceInfo);
    // res.cookie('refreshToken', newRefreshToken, cookieOptions);
    ApiResponse.success(res, { accessToken });
  }),

  logout: asyncHandler(async (req, res) => {
    const refreshToken = req.headers?.refreshtoken;
    await authService.logout(req.user.id, refreshToken);
    res.clearCookie('refreshToken', cookieOptions);
    ApiResponse.success(res, { message: 'Logged out' });
  }),

  // NEW — list active sessions
  getSessions: asyncHandler(async (req, res) => {
    const sessions = await authService.getActiveSessions(req.user.userId);
    ApiResponse.success(res, sessions);
  }),

  // NEW — revoke a specific session by id
  revokeSession: asyncHandler(async (req, res) => {
    await authService.revokeById(req.params.sessionId, req.user.userId);
    ApiResponse.success(res, { message: 'Session revoked' });
  }),
  //clear all sessions
  clearSessions: asyncHandler(async (req, res) => {
    await authService.revokeAllSessions(req.user.userId);
    ApiResponse.success(res, { message: 'clear all sessions' });
  }),
};
