import path from 'node:path';
import { copyTemplateFolder } from './templateGenerator.js';
import type { ProjectConfig } from '../config/schema.js';
import {
  databasePaths,
  validationPaths,
  cachePaths,
  queuePaths,
  websocketPaths,
  uploadPaths,
  documentationPaths,
  mailerPaths,
  authPaths,
} from '../config/moduleMap.js';

/**
 * This is the main function. It builds the whole project.
 *
 * Steps:
 * 1. Always copy the 'common' folder (every project needs this).
 * 2. Look at each answer in config.
 * 3. If the answer needs a template folder, copy that folder too.
 *
 * Note: some template folders are not built yet (like auth, queue,
 * cache). If a folder is missing, we log a warning and skip it,
 * instead of crashing. This lets us test piece by piece while we
 * are still building the templates folder.
 */
export async function generateProject(config: ProjectConfig, templatesRoot: string, targetDir: string): Promise<void> {
  // Step 1: common folder - always copied.
  await safeCopy(path.join(templatesRoot, 'common'), targetDir, 'common');

  // Step 2: auth folder - depends on auth.type AND auth.library together.
  if (config.auth.type === 'stateless' || config.auth.type === 'stateful') {
    const key = `${config.auth.type}-${config.auth.library}`;
    const relativePath = authPaths[key];
    await safeCopy(path.join(templatesRoot, relativePath), targetDir, `auth (${key})`);
  }
  // if 'none', skip - nothing to copy.

  // Step 3: all the simple one-to-one fields.
  await copyIfNotNull(templatesRoot, targetDir, databasePaths[config.database], `database (${config.database})`);
  await copyIfNotNull(templatesRoot, targetDir, validationPaths[config.validation], `validation (${config.validation})`);
  await copyIfNotNull(templatesRoot, targetDir, cachePaths[config.cache], `cache (${config.cache})`);
  await copyIfNotNull(templatesRoot, targetDir, queuePaths[config.queue], `queue (${config.queue})`);
  await copyIfNotNull(templatesRoot, targetDir, websocketPaths[config.websocket], `websocket (${config.websocket})`);
  await copyIfNotNull(templatesRoot, targetDir, uploadPaths[config.upload], `upload (${config.upload})`);
  await copyIfNotNull(templatesRoot, targetDir, documentationPaths[config.documentation], `documentation (${config.documentation})`);
  await copyIfNotNull(templatesRoot, targetDir, mailerPaths[config.mailer], `mailer (${config.mailer})`);
}

/** Copies a folder only if the map gave us a real path (not null). */
async function copyIfNotNull(templatesRoot: string, targetDir: string, relativePath: string | null, label: string): Promise<void> {
  if (relativePath === null) return; // nothing to copy for this choice
  await safeCopy(path.join(templatesRoot, relativePath), targetDir, label);
}

/** Copies a folder, but warns instead of crashing if it doesn't exist yet. */
async function safeCopy(sourceDir: string, targetDir: string, label: string): Promise<void> {
  try {
    await copyTemplateFolder(sourceDir, targetDir);
    console.log(`✔ copied: ${label}`);
  } catch (err) {
    console.warn(`⚠ skipped (template not built yet): ${label}`);
  }
}