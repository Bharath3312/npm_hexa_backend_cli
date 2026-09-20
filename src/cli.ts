#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPrompts } from './prompts/index.js';
import { validateConfig, InvalidConfigError } from './config/validate.js';
import { generateProject } from './generators/index.js';
import { generatePackageJson } from './generators/configFileGenerator.js';
import { runInstaller } from './installers/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('create-hexa-backend\n');

  const config = await runPrompts();

  validateConfig(config);

  const templatesRoot = path.join(__dirname, '..', 'templates');
  const targetDir = path.join(process.cwd(), config.projectName);

  console.log('\nGenerating your project...\n');
  await generatePackageJson(config, targetDir);
  await generateProject(config, templatesRoot, targetDir);

  await runInstaller(config, targetDir);

  console.log(`\n✅ Project created at: ${targetDir}`);
}

main().catch((err) => {
  if (err instanceof InvalidConfigError) {
    console.error(`\n❌ ${err.message}`);
  } else {
    console.error('\n❌ Something went wrong:', err);
  }
  process.exit(1);
});