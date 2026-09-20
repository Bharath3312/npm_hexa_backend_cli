import { resolveDependencies } from './dependencyResolver.js';
import { installDependencies } from './packageManager.js';
import type { ProjectConfig } from '../config/schema.js';

export async function runInstaller(config: ProjectConfig, targetDir: string): Promise<void> {
  const { dependencies, devDependencies } = resolveDependencies(config);

  console.log(`\nInstalling packages with ${config.packageManager}...`);
  console.log(`Dependencies: ${dependencies.join(', ') || '(none)'}`);
  console.log(`Dev dependencies: ${devDependencies.join(', ') || '(none)'}\n`);

  await installDependencies(config.packageManager, targetDir, dependencies, devDependencies);

  console.log('\n✅ All packages installed.');
}