import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { ProjectConfig } from '../config/schema.js';

/**
 * Each module that owns a database model adds:
 * - imports: the import line for the model file
 * - exports: the model name to export
 */
interface ModelPiece {
  imports: string[];
  exports: string[];
}

function buildModelPieces(config: ProjectConfig): ModelPiece[] {
  const pieces: ModelPiece[] = [];

  // The auth model is a mongoose schema, so it needs the mongoose ORM.
  if (config.auth === 'jsonwebtoken' && config.orm === 'mongoose') {
    pieces.push({
      imports: [`import { AuthSession } from './authSession.model.js';`],
      exports: [`AuthSession`],
    });
  }

  return pieces;
}

export async function generateModelsIndex(config: ProjectConfig, targetDir: string): Promise<void> {
  const pieces = buildModelPieces(config);

  const imports = pieces.flatMap((p) => p.imports).join('\n');
  const exportNames = pieces.flatMap((p) => p.exports).map((name) => `  ${name},`).join('\n');

  const content = `${imports ? imports + '\n\n' : ''}export {
${exportNames}
};
`;

  const dir = path.join(targetDir, 'src', 'models');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.model.js'), content);
}