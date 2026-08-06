import { generateProject } from './generators/index.js';
import type { ProjectConfig } from './config/schema.js';
import { validateConfig } from './config/validate.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fake config — like a user already answered all questions.
// This tests: "does everything work, without needing real prompts yet?"
const fakeConfig: ProjectConfig = {
  projectName: 'demo-app',
  packageManager: 'npm',
  auth: { type: 'stateless', library: 'jose' },
  database: 'mongodb',
  orm: 'mongoose',
  validation: 'zod',
  cache: 'redis',
  queue: 'bullmq',
  websocket: 'none',
  upload: 'multer',
  documentation: 'none',
  testing: 'none',
  logging: 'pino',
  mailer: 'nodemailer',
  eventEmitter: 'none',
};

validateConfig(fakeConfig);

const templatesRoot = path.join(__dirname, '..', 'templates');
const outputRoot = path.join(__dirname, '..', '.test-output', fakeConfig.projectName);

async function run() {
  await generateProject(fakeConfig, templatesRoot, outputRoot);
  console.log(`Generated project at: ${outputRoot}`);
}

run();