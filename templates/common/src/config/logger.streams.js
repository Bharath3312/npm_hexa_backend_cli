import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import pino from 'pino';

let currentDestination;
let baseFilePath;

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDailyPath(date, basePath) {
  const dir = dirname(basePath);
  const ext = extname(basePath) || '.log';
  const name = basename(basePath, ext);
  return resolve(dir, `${name}-${formatDate(date)}${ext}`);
}

export function createWriteStreams({ pretty, filePath }) {
  baseFilePath = filePath;

  try {
    mkdirSync(dirname(filePath), { recursive: true });
  } catch {
    /* ignore */
  }

  if (pretty) {
    return {
      prettyTransport: pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          messageFormat: '{msg}',
          singleLine: false,
        },
      }),
      destination: undefined,
    };
  }

  const initialPath = getDailyPath(new Date(), filePath);
  currentDestination = pino.destination({
    dest: initialPath,
    sync: false,
    mkdir: true,
  });

  return {
    destination: currentDestination,
    prettyTransport: undefined,
  };
}

export function rotateToDaily(date = new Date()) {
  if (!currentDestination || !baseFilePath) return;
  const nextPath = getDailyPath(date, baseFilePath);
  if (typeof currentDestination.reopen === 'function') {
    currentDestination.reopen(nextPath);
  }
}

export function purgeOldDailyFiles(retentionDays = 14) {
  if (!baseFilePath) return 0;
  const dir = dirname(baseFilePath);
  const ext = extname(baseFilePath) || '.log';
  const name = basename(baseFilePath, ext);
  const now = Date.now();
  const threshold = retentionDays * 24 * 60 * 60 * 1000;
  let removed = 0;

  try {
    const files = readdirSync(dir);
    for (const f of files) {
      if (!f.startsWith(`${name}-`) || !f.endsWith(ext)) continue;
      const full = resolve(dir, f);
      const st = statSync(full);
      if (now - st.mtimeMs > threshold) {
        rmSync(full, { force: true });
        removed++;
      }
    }
  } catch {
    /* ignore */
  }

  return removed;
}