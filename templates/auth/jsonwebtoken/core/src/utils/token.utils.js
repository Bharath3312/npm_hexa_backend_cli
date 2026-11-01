import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateAccessToken = (payload) =>
  jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiry });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiry });

export const generateTempToken = (payload) =>
  jwt.sign(payload, env.jwtTempSecret, { expiresIn: env.jwtTempExpiry });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);

export const verifyTempToken = (token) => jwt.verify(token, env.jwtTempSecret);
