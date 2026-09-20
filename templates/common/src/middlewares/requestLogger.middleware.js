import pinoHttp from 'pino-http';
import { logger } from '../config/logger.js';

export const requestLogger = pinoHttp({
  logger,
  // don't log health checks — they're noise
  autoLogging: {
        ignore: (req) => {
            if (req.url === '/') return true;
        // ignore health check
        if (req.url === '/health') return true;

        // ignore all bull board requests (static assets + api polls)
        if (req.url.startsWith('/admin/queues')) return true;

        if (req.url === '/favicon.ico') return true;

        return false;
        },
    },
  
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      ip: req.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});