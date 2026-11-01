import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { ProjectConfig } from '../config/schema.js';

/**
 * Each module can add code in 3 places inside user.route.js:
 * - imports: lines at the top
 * - publicRoutes: routes that need no login (written BEFORE commonRoute)
 * - protectedRoutes: routes that need login (written AFTER commonRoute)
 */
interface RoutePiece {
  imports: string[];
  publicRoutes: string[];
  protectedRoutes: string[];
}

function buildRoutePieces(config: ProjectConfig): RoutePiece[] {
  const pieces: RoutePiece[] = [];

  if (config.auth === 'jsonwebtoken') {
    pieces.push({
      imports: [
        `import { requireAuth } from '../middlewares/auth.middleware.js';`,
        `import { authController } from '../controllers/auth.controller.js';`,
      ],
      publicRoutes: [
        `userRoute.get('/get-refresh', authController.refresh);`,
      ],
      protectedRoutes: [
        `userRoute.use(requireAuth);`,
        ``,
        `userRoute.get('/logout', authController.logout);`,
        `userRoute.get('/get-sessions', authController.getSessions);`,
        `userRoute.get('/revokeSession/:sessionId', authController.revokeSession);`,
        `userRoute.get('/clearall-sessions', authController.clearSessions);`,
      ],
    });
  }

  return pieces;
}

export async function generateUserRoute(config: ProjectConfig, targetDir: string): Promise<void> {
  const pieces = buildRoutePieces(config);

  const imports = pieces.flatMap((p) => p.imports).join('\n');
  const publicRoutes = pieces.flatMap((p) => p.publicRoutes).join('\n');
  const protectedRoutes = pieces.flatMap((p) => p.protectedRoutes).join('\n');

  const content = `import { Router } from 'express';
import commonRoute from './common.route.js';
import { validate } from '../middlewares/validate.middleware.js';
${imports}

const userRoute = Router();

${publicRoutes}

userRoute.use(commonRoute);

${protectedRoutes}

export default userRoute;
`;

  const dir = path.join(targetDir, 'src', 'routes');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'user.route.js'), content);
}