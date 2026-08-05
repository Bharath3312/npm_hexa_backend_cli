/**
 * ProjectConfig is the single source of truth for a project being generated.
 *
 * Prompts (interactive questions) and any future non-interactive input
 * (CLI flags, a --config file) both produce this same shape. Every
 * generator and installer only ever reads from this type — never from
 * raw prompt answers directly. This keeps generation logic completely
 * decoupled from how the config was collected.
 */

export type PackageManager = 'npm' | 'pnpm' | 'yarn';

/**
 * Discriminated union: TypeScript enforces that `library` is required
 * whenever type is 'stateless' or 'stateful'. Constructing
 * { type: 'none', library: 'jose' } is a compile-time error.
 */
export type AuthLibrary = 'better-auth' | 'jose' | 'jsonwebtoken';

export type AuthConfig =
  | { type: 'stateless'; library: AuthLibrary }
  | { type: 'stateful'; library: AuthLibrary }
  | { type: 'none' };

export type Database = 'mongodb' | 'postgres' | 'mysql';

export type Orm = 'mongoose' | 'prisma' | 'typeorm';

export type Validation = 'zod' | 'joi';

export type Cache = 'redis' | 'none';

export type Queue = 'bullmq' | 'rabbitmq' | 'none';

export type WebSocket = 'socketio' | 'none';

export type FileUpload = 'multer' | 'none';

export type Documentation = 'swagger' | 'none';

export type Testing = 'jest' | 'vitest' | 'none';

export type Logging = 'pino' | 'winston';

export type Mailer = 'nodemailer' | 'none';

/**
 * 'node-events' uses Node's built-in `node:events` module — selecting it
 * adds zero npm dependencies. This matters later in the installer step:
 * dependencyResolver must treat this differently from every other
 * feature field, since there's nothing to add to package.json.
 */
export type EventEmitter = 'node-events' | 'none';

export interface ProjectConfig {
  projectName: string;
  packageManager: PackageManager;
  auth: AuthConfig;
  database: Database;
  orm: Orm;
  validation: Validation;
  cache: Cache;
  queue: Queue;
  websocket: WebSocket;
  upload: FileUpload;
  documentation: Documentation;
  testing: Testing;
  logging: Logging;
  mailer: Mailer;
  eventEmitter: EventEmitter;
}