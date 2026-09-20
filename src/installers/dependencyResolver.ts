import type { ProjectConfig } from '../config/schema.js';

export interface ResolvedDependencies {
  dependencies: string[];
  devDependencies: string[];
}

/**
 * Looks at ALL the user's answers, and builds ONE final list of npm
 * packages needed. We use a Set (not a plain array) to avoid
 * duplicates — example: both "cache=redis" and "queue=bullmq" need
 * "ioredis". A Set makes sure "ioredis" only appears once in the
 * final list, even though two different modules asked for it.
 */
export function resolveDependencies(config: ProjectConfig): ResolvedDependencies {
  const dependencies = new Set<string>();
  const devDependencies = new Set<string>();

  // Always needed, no matter what the user picks.
  dependencies.add('express');
  dependencies.add('dotenv');

  // Auth
  if (config.auth.type !== 'none') {
    if (config.auth.library === 'jose') dependencies.add('jose');
    if (config.auth.library === 'jsonwebtoken') dependencies.add('jsonwebtoken');
    if (config.auth.library === 'better-auth') dependencies.add('better-auth');
  }

  // Database + ORM
  if (config.database === 'mongodb') dependencies.add('mongoose');
  if (config.database === 'postgres' || config.database === 'mysql') {
    if (config.orm === 'prisma') dependencies.add('prisma');
    if (config.orm === 'typeorm') dependencies.add('typeorm');
  }

  // Validation
  if (config.validation === 'zod') dependencies.add('zod');
  if (config.validation === 'joi') dependencies.add('joi');

  // Cache OR queue=bullmq both need ioredis — same rule as our
  // generator's "needsRedis" check, kept in sync on purpose.
  if (config.cache === 'redis' || config.queue === 'bullmq') {
    dependencies.add('ioredis');
  }

  // Queue
  if (config.queue === 'bullmq') {
    dependencies.add('bullmq');
    dependencies.add('@bull-board/api');
    dependencies.add('@bull-board/express');
  }
  if (config.queue === 'rabbitmq') {
    dependencies.add('amqplib');
  }

  // WebSocket
  if (config.websocket === 'socketio') dependencies.add('socket.io');

  // Upload
  if (config.upload === 'multer') dependencies.add('multer');

  // Documentation
  if (config.documentation === 'swagger') {
    dependencies.add('swagger-ui-express');
    dependencies.add('swagger-jsdoc');
  }

  // Testing goes in devDependencies — not needed to RUN the app,
  // only to test it during development.
  if (config.testing === 'jest') devDependencies.add('jest');
  if (config.testing === 'vitest') devDependencies.add('vitest');

  // Logging
  if (config.logging === 'pino') dependencies.add('pino');
  if (config.logging === 'winston') dependencies.add('winston');

  // Mailer
  if (config.mailer === 'nodemailer') dependencies.add('nodemailer');

  // EventEmitter: 'node-events' is BUILT INTO Node itself.
  // No package needed — this is why nothing is added here for it.

  return {
    dependencies: [...dependencies],
    devDependencies: [...devDependencies],
  };
}