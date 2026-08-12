import http from 'http';
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from './config/logger.js';
import { connectDB, disconnectDB } from './config/mongo.database.js';
import { closeRedis, initRedis } from './config/redis.js';
import { startAll, stopAll } from './bullmq/index.js';
import { getBullBoardRouter, initBullBoard } from './bullmq/board.js';
import httpGracefulShutdown from 'http-graceful-shutdown';
import basicAuth from 'express-basic-auth';
import { notFound } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';


function startLogRotation() {
  // check every 5 minutes if midnight has passed
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() < 5) {
      rotateToDaily(now);
      const removed = purgeOldDailyFiles(Number(env.logRetentionDays) || 14);
      if (removed > 0) logger.info(`Log rotation: removed ${removed} old files`);
    }
  }, 5 * 60 * 1000);
}



async function start() {

// ── 1. infrastructure first ──────────────────────
  await connectDB();
  await initRedis();

// ── 2. queues and workers ────────────────────────
  startAll();
  initBullBoard();

  startLogRotation();

    if (env.nodeEnv === 'production') {
        app.use(
            '/admin/queues',
            basicAuth({
            users: { [env.bullBoardUser]: env.bullBoardPassword },
            challenge: true, // triggers browser login popup
            })
        );
    }
    app.use('/admin/queues',getBullBoardRouter());

// NOW register notFound and errorHandler — after everything else
  app.use(notFound);
  app.use(errorHandler);

// ── 3. app ───────────────────────────────────────
  const server = http.createServer(app);

// ── 4. real-time layers ──────────────────────────
//   initSocketServer(server);
//   connectExternalWS();


// ── 5. graceful shutdown ─────────────────────────
  httpGracefulShutdown(server, {
    signals: 'SIGINT SIGTERM',
    timeout: 15000,          // give workers time to finish in-flight jobs
    forceExit: true,
    development: env.nodeEnv === 'development',

    preShutdown: async () => {
      // fires first — stop NEW connections coming in
      // HTTP server still running here, draining existing requests
      logger.info('Shutdown initiated — closing incoming connections');
    //   closeExternalWS();         // stop outbound WS feed
    //   await closeSocketServer(); // stop new socket.io connections
    },

    onShutdown: async (signal) => {
      // fires after HTTP server stops — drain everything in flight
      logger.info(`Draining — signal: ${signal}`);

      // workers first — finish in-flight jobs, close their Redis connections
      // queues second — close producer connections
      await stopAll();

      // DB and Redis last — workers/queues needed them above
      await disconnectDB();
      await closeRedis();

      logger.info('All dependencies closed');
    },

    finally: () => {
      logger.info(`Server on port ${env.port} shut down cleanly`);
    },
  });

    // ── 6. listen — only after everything is ready ───
  server.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port}`);
  });

}

// catch startup failures
start().catch((err) => {
  logger.error('Failed to start server', { err });
  process.exit(1);
});