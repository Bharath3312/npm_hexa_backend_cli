import path from 'node:path';
import { copyTemplateFolder } from './templateGenerator.js';
import type { ProjectConfig } from '../config/schema.js';
import {
  databasePaths,
  ormPaths,
  validationPaths,
  queuePaths,
  websocketPaths,
  uploadPaths,
  documentationPaths,
  mailerPaths,
  eventEmitterPaths,
  authPaths,
  authOrmPaths,
} from '../config/moduleMap.js';

export async function generateProject(config: ProjectConfig, templatesRoot: string, targetDir: string): Promise<void> {
  // 1. common: always copied
  await safeCopy(path.join(templatesRoot, 'common'), targetDir, 'common');

  // 2. database first (empty stub), 3. ORM second (overwrites the stub)
  await copyIfNotNull(templatesRoot, targetDir, databasePaths[config.database], `database (${config.database})`);
  await copyIfNotNull(templatesRoot, targetDir, ormPaths[config.orm], `orm (${config.orm})`);

  // 4. auth core, 5. auth adapter (overwrites models/index from common)
  await copyIfNotNull(templatesRoot, targetDir, authPaths[config.auth], `auth (${config.auth})`);
  if (config.auth !== 'none') {
    await copyIfNotNull(
      templatesRoot,
      targetDir,
      authOrmPaths[config.auth][config.orm],
      `auth adapter (${config.auth} + ${config.orm})`,
    );
  }

  // 6. the rest
  await copyIfNotNull(templatesRoot, targetDir, validationPaths[config.validation], `validation (${config.validation})`);

  // Redis is needed if cache=redis OR queue=bullmq
  const needsRedis = config.cache === 'redis' || config.queue === 'bullmq';
  if (needsRedis) {
    await safeCopy(path.join(templatesRoot, 'cache/redis'), targetDir, 'cache (redis)');
  }

  await copyIfNotNull(templatesRoot, targetDir, queuePaths[config.queue], `queue (${config.queue})`);
  await copyIfNotNull(templatesRoot, targetDir, websocketPaths[config.websocket], `websocket (${config.websocket})`);
  await copyIfNotNull(templatesRoot, targetDir, uploadPaths[config.upload], `upload (${config.upload})`);
  await copyIfNotNull(templatesRoot, targetDir, documentationPaths[config.documentation], `documentation (${config.documentation})`);
  await copyIfNotNull(templatesRoot, targetDir, mailerPaths[config.mailer], `mailer (${config.mailer})`);
  await copyIfNotNull(templatesRoot, targetDir, eventEmitterPaths[config.eventEmitter], `eventEmitter (${config.eventEmitter})`);
}

async function copyIfNotNull(templatesRoot: string, targetDir: string, relativePath: string | null, label: string): Promise<void> {
  if (relativePath === null) return;
  await safeCopy(path.join(templatesRoot, relativePath), targetDir, label);
}

async function safeCopy(sourceDir: string, targetDir: string, label: string): Promise<void> {
  try {
    await copyTemplateFolder(sourceDir, targetDir);
    console.log(`✔ copied: ${label}`);
  } catch (err) {
    console.warn(`⚠ skipped (template not built yet): ${label}`);
  }
}