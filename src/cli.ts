#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPrompts } from './prompts/index.js';
import { validateConfig, InvalidConfigError } from './config/validate.js';
import { generateProject } from './generators/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('create-hexa-backend\n');

  const config = await runPrompts();

  validateConfig(config);

  const templatesRoot = path.join(__dirname, '..', 'templates');
  const targetDir = path.join(process.cwd(), config.projectName);

  console.log('\nGenerating your project...\n');
  await generateProject(config, templatesRoot, targetDir);

  console.log(`\n✅ Project created at: ${targetDir}`);
}

main().catch((err) => {
  if (err instanceof InvalidConfigError) {
    // A known, expected problem - show a clean message, no scary stack trace.
    console.error(`\n❌ ${err.message}`);
  } else {
    // Something unexpected - show the full error for debugging.
    console.error('\n❌ Something went wrong:', err);
  }
  process.exit(1);
});