import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { ProjectConfig } from '../config/schema.js';

/**
 * Each module can add code in these places inside server.js:
 * - imports: lines at the top
 * - init: startup calls
 * - adminRoutes: extra express routes
 * - afterServer: runs right after http.createServer
 * - preShutdown: runs first when shutting down
 * - shutdownPhase1: stop workers/queues first
 * - shutdownPhase2: close database/redis last
 */
interface ModulePiece {
  imports: string[];
  init: string[];
  adminRoutes?: string;
  afterServer: string[];
  preShutdown: string[];
  shutdownPhase1: string[];
  shutdownPhase2: string[];
}

function buildModulePieces(config: ProjectConfig): ModulePiece[] {
  const pieces: ModulePiece[] = [];

  // Database: always present. database.js is an empty stub, or the real
  // code when an ORM is picked. The file name is the same in both cases.
  pieces.push({
    imports: [`import { connectDB, disconnectDB } from './config/database.js';`],
    init: [`await connectDB();`],
    afterServer: [],
    preShutdown: [],
    shutdownPhase1: [],
    shutdownPhase2: [`await disconnectDB();`],
  });

  // Redis is needed if cache=redis OR queue=bullmq
  const needsRedis = config.cache === 'redis' || config.queue === 'bullmq';
  if (needsRedis) {
    pieces.push({
      imports: [`import { initRedis, closeRedis } from './config/redis.js';`],
      init: [`await initRedis();`],
      afterServer: [],
      preShutdown: [],
      shutdownPhase1: [],
      shutdownPhase2: [`await closeRedis();`],
    });
  }

  if (config.queue === 'bullmq') {
    pieces.push({
      imports: [
        `import { startAll, stopAll } from './bullmq/index.js';`,
        `import { getBullBoardRouter, initBullBoard } from './bullmq/board.js';`,
        `import basicAuth from 'express-basic-auth';`,
      ],
      init: [`startAll();`, `initBullBoard();`],
      adminRoutes: `
  if (env.nodeEnv === 'production') {
    app.use(
      '/admin/queues',
      basicAuth({
        users: { [env.bullBoardUser]: env.bullBoardPassword },
        challenge: true,
      })
    );
  }
  app.use('/admin/queues', getBullBoardRouter());`,
      afterServer: [],
      preShutdown: [],
      shutdownPhase1: [`await stopAll();`],
      shutdownPhase2: [],
    });
  }

  if (config.websocket === 'socketio') {
    pieces.push({
      imports: [`import { initSocketServer, closeSocketServer } from './sockets/index.js';`],
      init: [],
      afterServer: [`initSocketServer(server);`],
      preShutdown: [`await closeSocketServer();`],
      shutdownPhase1: [],
      shutdownPhase2: [],
    });
  }

  return pieces;
}

export async function generateServerFile(config: ProjectConfig, targetDir: string): Promise<void> {
  const pieces = buildModulePieces(config);

  const imports = pieces.flatMap((p) => p.imports).join('\n');
  const initCalls = pieces.flatMap((p) => p.init).map((l) => `  ${l}`).join('\n');
  const adminRoutes = pieces.map((p) => p.adminRoutes).filter(Boolean).join('\n');
  const afterServer = pieces.flatMap((p) => p.afterServer).map((l) => `  ${l}`).join('\n');
  const preShutdown = pieces.flatMap((p) => p.preShutdown).map((l) => `      ${l}`).join('\n');
  const shutdownPhase1 = pieces.flatMap((p) => p.shutdownPhase1).map((l) => `      ${l}`).join('\n');
  const shutdownPhase2 = pieces.flatMap((p) => p.shutdownPhase2).map((l) => `      ${l}`).join('\n');

  const content = `import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { rotateToDaily, purgeOldDailyFiles } from './config/logger.streams.js';
import httpGracefulShutdown from 'http-graceful-shutdown';
import { notFound } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
${imports}

function startLogRotation() {
  // check every 5 minutes if midnight has passed
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() < 5) {
      rotateToDaily(now);
      const removed = purgeOldDailyFiles(Number(env.logRetentionDays) || 14);
      if (removed > 0) logger.info(\`Log rotation: removed \${removed} old files\`);
    }
  }, 5 * 60 * 1000);
}

async function start() {
  // ── 1. infrastructure first ──────────────────────
${initCalls}

  startLogRotation();
${adminRoutes}

  // notFound and errorHandler must be registered AFTER everything else
  app.use(notFound);
  app.use(errorHandler);

  // ── 2. http server ───────────────────────────────
  const server = http.createServer(app);
${afterServer}

  // ── 3. graceful shutdown ─────────────────────────
  httpGracefulShutdown(server, {
    signals: 'SIGINT SIGTERM',
    timeout: 15000,
    forceExit: true,
    development: env.nodeEnv === 'development',

    preShutdown: async () => {
      logger.info('Shutdown initiated — closing incoming connections');
${preShutdown}
    },

    onShutdown: async (signal) => {
      logger.info(\`Draining — signal: \${signal}\`);

      // workers/queues first — finish in-flight jobs
${shutdownPhase1 || '      // nothing to stop here'}

      // db/redis last — other things above may still need them
${shutdownPhase2 || '      // nothing to close here'}

      logger.info('All dependencies closed');
    },

    finally: () => {
      logger.info(\`Server on port \${env.port} shut down cleanly\`);
    },
  });

  // ── 4. listen — only after everything is ready ───
  server.listen(env.port, () => {
    logger.info(\`Server listening on port \${env.port}\`);
  });
}

// catch startup failures
start().catch((err) => {
  logger.error('Failed to start server', { err });
  process.exit(1);
});
`;

  await mkdir(path.join(targetDir, 'src'), { recursive: true });
  await writeFile(path.join(targetDir, 'src', 'server.js'), content);
}