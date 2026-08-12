// import { createLogger, format, transports } from 'winston';
// import { env } from './env.js';

// export const logger = createLogger({
//   level: env.nodeEnv === 'production' ? 'info' : 'debug',
//   format: format.combine(
//     format.timestamp(),
//     format.errors({ stack: true }),
//     env.nodeEnv === 'production' ? format.json() : format.combine(format.colorize(), format.simple())
//   ),
//   transports: [
//     new transports.Console(),
//     new transports.File({ filename: 'logs/error.log', level: 'error' }),
//     new transports.File({ filename: 'logs/combined.log' }),
//   ],
// });



import pino from 'pino';
import { createWriteStreams } from './logger.streams.js';
import { env } from './env.js';

const isDevelopment = env.nodeEnv === 'development';
const isTest = env.nodeEnv === 'test';

const { destination, prettyTransport } = createWriteStreams({
  pretty: isDevelopment,
  filePath: env.appLogFile || 'logs/app.log',
});

export const logger = pino(
  {
    level: env.logLevel || (isDevelopment ? 'debug' : 'info'),
    enabled: !isTest,
    base: {
      env: env.nodeEnv,
      // service: 'copy-trading-bot',
      // version : "v1.0"
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.currentPassword',
        'req.body.newPassword',
        'req.body.token',
        'req.body.otp',
        'user.password',
        'user.refreshToken',
        'res.headers["set-cookie"]',
      ],
      censor: '***',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  isDevelopment ? prettyTransport : destination
);