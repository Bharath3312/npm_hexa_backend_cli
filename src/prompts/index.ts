import { input, select } from '@inquirer/prompts';
import type { ProjectConfig, AuthLibrary } from '../config/schema.js';
import {
  SUPPORTED_DATABASES,
  SUPPORTED_ORMS,
  SUPPORTED_QUEUES,
  SUPPORTED_CACHES,
  SUPPORTED_WEBSOCKETS,
  SUPPORTED_UPLOADS,
  SUPPORTED_DOCUMENTATION,
  SUPPORTED_TESTING,
  SUPPORTED_VALIDATION,
  SUPPORTED_LOGGING,
  SUPPORTED_MAILER,
  SUPPORTED_EVENT_EMITTERS,
  SUPPORTED_AUTH_CONFIGS,
} from '../config/supported.js';

/**
 * Asks the user all questions, one at a time, and returns a full
 * ProjectConfig — the same shape our generator already knows how to
 * read. This is the ONLY place in the whole CLI that talks to the
 * terminal directly. Everything after this point (validate, generate)
 * never touches prompts again.
 */
export async function runPrompts(): Promise<ProjectConfig> {
  const projectName = await input({
    message: 'Project name:',
    default: 'my-app',
  });

  const packageManager = await select({
    message: 'Package manager:',
    choices: [
      { name: 'npm', value: 'npm' },
      { name: 'pnpm', value: 'pnpm' },
      { name: 'yarn', value: 'yarn' },
    ],
  });

  const auth = await askAuth();

  const database = await pickOne('Database:', SUPPORTED_DATABASES);
  const orm = await pickOne('ORM/ODM:', SUPPORTED_ORMS);
  const validation = await pickOne('Validation:', SUPPORTED_VALIDATION);
  const cache = await pickOne('Cache:', SUPPORTED_CACHES);
  const queue = await pickOne('Queue:', SUPPORTED_QUEUES);
  const websocket = await pickOne('WebSocket:', SUPPORTED_WEBSOCKETS);
  const upload = await pickOne('File Upload:', SUPPORTED_UPLOADS);
  const documentation = await pickOne('Documentation:', SUPPORTED_DOCUMENTATION);
  const testing = await pickOne('Testing:', SUPPORTED_TESTING);
  const logging = await pickOne('Logging:', SUPPORTED_LOGGING);
  const mailer = await pickOne('Mailer:', SUPPORTED_MAILER);
  const eventEmitter = await pickOne('Event Emitter:', SUPPORTED_EVENT_EMITTERS);

  return {
    projectName,
    packageManager: packageManager as ProjectConfig['packageManager'],
    auth,
    database,
    orm,
    validation,
    cache,
    queue,
    websocket,
    upload,
    documentation,
    testing,
    logging,
    mailer,
    eventEmitter,
  };
}

/**
 * Auth needs two connected questions: first "type" (stateless /
 * stateful / none), then "library" — but only if type isn't 'none'.
 * This is the branching logic we talked about earlier.
 */
async function askAuth(): Promise<ProjectConfig['auth']> {
  const type = await select({
    message: 'Authentication:',
    choices: [
      { name: 'Stateless', value: 'stateless' },
      { name: 'Stateful', value: 'stateful' },
      { name: 'None', value: 'none' },
    ],
  });

  if (type === 'none') {
    return { type: 'none' };
  }

  // Only show libraries that are actually supported for this type,
  // by reading straight from SUPPORTED_AUTH_CONFIGS instead of
  // hardcoding a list here.
  const libraries = SUPPORTED_AUTH_CONFIGS.filter(
    (c): c is { type: 'stateless' | 'stateful'; library: AuthLibrary } =>
      c.type === type,
  ).map((c) => c.library);

  const library = await select({
    message: 'Authentication library:',
    choices: libraries.map((lib) => ({ name: lib, value: lib })),
  });

  return { type, library } as ProjectConfig['auth'];
}

/**
 * Generic helper for every simple field: if there's only ONE
 * supported option, skip asking and use it automatically — no point
 * asking a question with just one possible answer. If there's more
 * than one, ask the user to pick.
 */
async function pickOne<T extends string>(message: string, options: T[]): Promise<T> {
  if (options.length === 0) {
    throw new Error(`No supported options available for: ${message}`);
  }
  if (options.length === 1) {
    return options[0];
  }
  const value = await select({
    message,
    choices: options.map((opt) => ({ name: opt, value: opt })),
  });
  return value as T;
}