import type {
  Database,
    Orm,
  Queue,
  Cache,
  WebSocket,
  FileUpload,
  Documentation,
  Testing,
  Validation,
  Logging,
  Mailer,
  EventEmitter,
  AuthConfig,
  PackageManager,
} from './schema.js';

/**
 * This file lists what is ACTUALLY READY in version 1.0.0.
 *
 * schema.ts keeps ALL possible future options (mongodb, postgres,
 * mysql, etc). That file does not change often — it's the full
 * design.
 *
 * This file is different. It's small and changes often. Every time
 * you finish building a new template folder (e.g. postgres support),
 * you add ONE line here. Nothing else needs to change.
 *
 * Later, the prompt step (the interactive questions) will read this
 * file to decide what choices to SHOW the user. This way, a user can
 * never even select an option that isn't built yet.
 */

export const SUPPORTED_DATABASES: Database[] = ['mongodb'];

export const SUPPORTED_ORMS: Orm[] = ['mongoose'];


export const SUPPORTED_PACKAGE_MANAGERS: PackageManager[] = ['npm'];

export const SUPPORTED_QUEUES: Queue[] = ['bullmq', 'none'];

export const SUPPORTED_CACHES: Cache[] = ['redis','none'];

export const SUPPORTED_WEBSOCKETS: WebSocket[] = ['socketio','none'];

export const SUPPORTED_UPLOADS: FileUpload[] = ['multer', 'none'];

export const SUPPORTED_DOCUMENTATION: Documentation[] = ['swagger', 'none'];

export const SUPPORTED_TESTING: Testing[] = ['none'];

export const SUPPORTED_VALIDATION: Validation[] = ['zod'];

export const SUPPORTED_LOGGING: Logging[] = ['pino'];

export const SUPPORTED_MAILER: Mailer[] = ['nodemailer', 'none'];

export const SUPPORTED_EVENT_EMITTERS: EventEmitter[] = ['node-events', 'none'];


/**
 * Auth is not a simple flat list (like Database or Cache), because
 * type and library are connected together. So instead of a list of
 * words, this is a list of full auth config objects — every combo
 * that is ready to use right now.
 */
export const SUPPORTED_AUTH_CONFIGS: AuthConfig[] = [
  { type: 'stateless', library: 'jose' },
  { type: 'stateless', library: 'jsonwebtoken' },
  { type: 'stateless', library: 'better-auth' },
  { type: 'stateful', library: 'jose' },
  { type: 'stateful', library: 'jsonwebtoken' },
  { type: 'stateful', library: 'better-auth' },
  { type: 'none' },
];