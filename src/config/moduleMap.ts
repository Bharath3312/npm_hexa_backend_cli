/**
 * This file is a "map". It connects config answers to template folder
 * names. Example: if database is 'mongodb', the folder is
 * 'database/mongodb'.
 *
 * Why we use a map instead of if/else:
 * - Shorter to read.
 * - Easy to add new options (just add one line).
 * - TypeScript checks it for mistakes.
 */

import type {
  Database,
  Orm,
  Validation,
  Cache,
  Queue,
  WebSocket,
  FileUpload,
  Documentation,
  Testing,
  Logging,
  Mailer,
  EventEmitter,
} from './schema.js';

export const databasePaths: Record<Database, string> = {
  mongodb: 'database/mongodb',
  postgres: 'database/postgres',
  mysql: 'database/mysql',
};

// ORM does not need its own template folder for now.
// It is handled together with the database folder.
// We keep this map here so it is ready when we need it later.
export const ormPaths: Record<Orm, string | null> = {
  mongoose: null,
  prisma: null,
  typeorm: null,
};

export const validationPaths: Record<Validation, string> = {
  zod: 'validation/zod',
  joi: 'validation/joi',
};

// 'none' means: do not copy any folder.
export const cachePaths: Record<Cache, string | null> = {
  redis: 'cache/redis',
  none: null,
};

export const queuePaths: Record<Queue, string | null> = {
  bullmq: 'queue/bullmq',
  rabbitmq: 'queue/rabbitmq',
  none: null,
};

export const websocketPaths: Record<WebSocket, string | null> = {
  socketio: 'websocket/socketio',
  none: null,
};

export const uploadPaths: Record<FileUpload, string | null> = {
  multer: 'upload/multer',
  none: null,
};

export const documentationPaths: Record<Documentation, string | null> = {
  swagger: 'documentation/swagger',
  none: null,
};

// Testing setup files may not need a full folder copy yet.
// Kept null for now, ready to fill in later.
export const testingPaths: Record<Testing, string | null> = {
  jest: null,
  vitest: null,
  none: null,
};

// Logging is always required (no 'none' option), so both point
// somewhere. Folder not built yet - we will build it soon.
export const loggingPaths: Record<Logging, string | null> = {
  pino: null,
  winston: null,
};

export const mailerPaths: Record<Mailer, string | null> = {
  nodemailer: 'mailer/nodemailer',
  none: null,
};

// node-events uses Node's built-in module. No template folder needed
// for the library itself, but we may still copy the events/ wiring
// folder later. Kept null for now.
export const eventEmitterPaths: Record<EventEmitter, string | null> = {
  'node-events': null,
  none: null,
};

/**
 * All 6 auth combos need separate folders, because the code is
 * different for each one (stateless jose ≠ stateful jose, etc).
 * The key is built as "type-library", e.g. "stateless-jose".
 */
export const authPaths: Record<string, string> = {
  'stateless-jose': 'auth/stateless-jose',
  'stateless-jsonwebtoken': 'auth/stateless-jsonwebtoken',
  'stateless-better-auth': 'auth/stateless-better-auth',
  'stateful-jose': 'auth/stateful-jose',
  'stateful-jsonwebtoken': 'auth/stateful-jsonwebtoken',
  'stateful-better-auth': 'auth/stateful-better-auth',
};