import { spawn } from 'node:child_process';
import type { PackageManager } from '../config/schema.js';

/**
 * Each package manager uses slightly different words for "install".
 * This table hides that difference from the rest of our code — the
 * rest of the CLI never needs to know these details.
 */
const INSTALL_WORDS: Record<PackageManager, { add: string; dev: string }> = {
  npm: { add: 'install', dev: '--save-dev' },
  pnpm: { add: 'add', dev: '--save-dev' },
  yarn: { add: 'add', dev: '--dev' },
};

/**
 * Runs one real terminal command inside the new project folder.
 * Uses spawn (not exec) with stdio: 'inherit' so the real npm/pnpm/
 * yarn output streams live to the user's screen — installs can take
 * a while, and a silent frozen terminal feels broken even when it's
 * actually working fine.
 */
function runCommand(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit', shell: true });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed: ${command} ${args.join(' ')} (exit code ${code})`));
    });
    child.on('error', reject);
  });
}

export async function installDependencies(
  packageManager: PackageManager,
  targetDir: string,
  dependencies: string[],
  devDependencies: string[],
): Promise<void> {
  const { add, dev } = INSTALL_WORDS[packageManager];

  if (dependencies.length > 0) {
    await runCommand(packageManager, [add, ...dependencies], targetDir);
  }

  if (devDependencies.length > 0) {
    await runCommand(packageManager, [add, dev, ...devDependencies], targetDir);
  }
}