import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { ProjectConfig } from '../config/schema.js';

/**
 * Writes a starter package.json into the new project BEFORE we run
 * npm/pnpm/yarn install. The package manager needs this file to
 * already exist — it's where the install command WRITES the real
 * dependency version numbers once it looks them up.
 */
export async function generatePackageJson(config: ProjectConfig, targetDir: string): Promise<void> {
  const packageJson = {
    name: config.projectName,
    version: '0.1.0',
    type: 'module',
    main: 'src/server.js',
    scripts: {
      start: 'node src/server.js',
      dev: 'node --watch src/server.js',
    },
    dependencies: {},
    devDependencies: {},
  };

  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, 'package.json'), JSON.stringify(packageJson, null, 2));
}