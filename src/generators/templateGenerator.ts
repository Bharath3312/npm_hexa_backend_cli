import { cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';

/**
 * Copies everything inside `sourceDir` into `targetDir`, merging into
 * whatever's already there (important: this function gets called once
 * per selected module — e.g. once for `common/`, once for `auth/jwt/`,
 * once for `database/mongodb/` — and each call must layer on top of the
 * previous one, not overwrite the whole target).
 */
export async function copyTemplateFolder(sourceDir: string, targetDir: string): Promise<void> {
  if (!existsSync(sourceDir)) {
    throw new Error(`Template source folder does not exist: ${sourceDir}`);
  }

  await cp(sourceDir, targetDir, {
    recursive: true,
    // If the same relative path is copied twice by two different
    // modules (shouldn't happen for common+module pairs today, but
    // will matter once modules can contribute to shared files), this
    // decides last-write-wins. We'll replace this with real merge
    // logic later — flagged here on purpose, not silently hidden.
    force: true,
  });
}