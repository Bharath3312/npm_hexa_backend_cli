import { Server } from 'socket.io';
import { logger } from '../config/logger.js';
import { registerHandlers } from './handlers/index.js';

let io;

export function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  //   io.use((socket, next) => {
  //     try {
  //       const token =
  //         socket.handshake.auth.token ||
  //         socket.handshake.headers.authorization?.split(' ')[1];

  //       if (!token) return next(new Error('No token provided'));

  //       const payload = jwtService.verify(token);
  //       socket.user = payload;
  //       next();
  //     } catch (err) {
  //       next(new Error('Invalid or expired token'));
  //     }
  //   });

  io.on('connection', (socket) => {
    logger.info('Socket connected');
    registerHandlers(io, socket);
    socket.on('disconnect', () => {
      logger.info('Socket disconnected');
    });
  });

  return io;
}

export function getIo() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export async function closeSocketServer() {
  if (io) {
    await io.close();
    logger.info('Socket server closed');
  }
}
