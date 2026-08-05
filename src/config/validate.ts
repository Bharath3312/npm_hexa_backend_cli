import type { ProjectConfig } from './schema.js';

/**
 * Cross-field rules that ProjectConfig's flat structure can't express
 * at the type level (unlike AuthConfig, which uses a discriminated
 * union because that relationship was worth enforcing at compile time).
 *
 * These act as a safety net — the interactive prompt flow should never
 * let a user reach an invalid combination in the first place, but this
 * guards against bugs in that flow, and against any future
 * non-interactive input path (e.g. --config file.json) that bypasses
 * prompts entirely.
 */

const VALID_ORMS_BY_DATABASE: Record<ProjectConfig['database'], ProjectConfig['orm'][]> = {
  mongodb: ['mongoose'],
  postgres: ['prisma', 'typeorm'],
  mysql: ['prisma', 'typeorm'],
};

export class InvalidConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidConfigError';
  }
}

export function validateConfig(config: ProjectConfig): void {
  const allowedOrms = VALID_ORMS_BY_DATABASE[config.database];

  if (!allowedOrms.includes(config.orm)) {
    throw new InvalidConfigError(
      `"${config.orm}" is not a valid ORM/ODM choice for database "${config.database}". ` +
        `Valid options are: ${allowedOrms.join(', ')}.`,
    );
  }

  if (!config.projectName || config.projectName.trim().length === 0) {
    throw new InvalidConfigError('Project name cannot be empty.');
  }
}