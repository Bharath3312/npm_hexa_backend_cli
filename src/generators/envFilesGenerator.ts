import { writeFile, mkdir } from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import type { ProjectConfig } from '../config/schema.js';

/**
 * One env key.
 * - name: the name in the .env file (REDIS_URL)
 * - prop: the name in env.js (redisUrl)
 * - default: fallback used in env.js code, and also written in .env
 * - fill: a value written in .env files only (not in env.js code)
 * - secret: .env gets a random value, other files stay empty
 */
interface EnvKey {
  name: string;
  prop: string;
  default?: string | number;
  fill?: string;
  secret?: boolean;
}

interface EnvGroup {
  title: string;
  keys: EnvKey[];
}

function buildGroups(config: ProjectConfig): EnvGroup[] {
  const groups: EnvGroup[] = [];

  // Always
  groups.push({
    title: 'App',
    keys: [
      { name: 'PORT', prop: 'port', fill: '3000' },
      { name: 'NODE_ENV', prop: 'nodeEnv', default: 'development' },
      { name: 'ENCRYPT', prop: 'encryptionKey', secret: true },
      { name: 'APP_NAME', prop: 'app_name', fill: config.projectName },
      { name: 'IMAGEURL', prop: 'image_url' },
      { name: 'LOG_RETENTION_DAYS', prop: 'logRetentionDays', fill: '14' },
    ],
  });

  // Database: every database needs a connection string
  if(config.database != 'none'){
    groups.push({
      title: 'Database',
      keys: [
        {
          name: 'DB_URI',
          prop: 'db',
          fill: config.database === 'mongodb' ? `mongodb://127.0.0.1:27017/${config.projectName}` : '',
        },
      ],
    });
  }

  if (config.auth === 'jsonwebtoken') {
    groups.push({
      title: 'Auth',
      keys: [
        { name: 'ACCESS_TOKEN_SECRET', prop: 'jwtAccessSecret', secret: true },
        { name: 'ACCESS_TOKEN_EXPIRY', prop: 'jwtAccessExpiry', default: '15m' },
        { name: 'REFRESH_TOKEN_SECRET', prop: 'jwtRefreshSecret', secret: true },
        { name: 'REFRESH_TOKEN_EXPIRY', prop: 'jwtRefreshExpiry', default: '7d' },
        { name: 'TEMP_TOKEN_SECRET', prop: 'jwtTempSecret', secret: true },
        { name: 'TEMP_TOKEN_EXPIRY', prop: 'jwtTempExpiry', default: '1d' },
      ],
    });
  }

  if (config.mailer === 'nodemailer') {
    groups.push({
      title: 'Mail',
      keys: [
        { name: 'MAILHOST', prop: 'smtpHost' },
        { name: 'MAILPORT', prop: 'smtpPort', default: 465 },
        { name: 'MAIL', prop: 'smtpUser' },
        { name: 'PASS', prop: 'smtpPass' },
        { name: 'SUPPORTMAIL', prop: 'support_mail' },
        { name: 'MAIL_FOOTER', prop: 'mail_footer' },
        { name: 'FROM_MAIL', prop: 'from_mail' },
      ],
    });
  }

  // Redis is needed if cache=redis OR queue=bullmq (same rule as everywhere)
  if (config.cache === 'redis' || config.queue === 'bullmq') {
    groups.push({
      title: 'Redis',
      keys: [
        { name: 'REDIS_URL', prop: 'redisUrl' },
        { name: 'REDIS_HOST', prop: 'redisHost', fill: '127.0.0.1' },
        { name: 'REDIS_PORT', prop: 'redisPort', fill: '6379' },
        { name: 'REDIS_PASSWORD', prop: 'redisPassword' },
      ],
    });
  }

  if (config.queue === 'bullmq') {
    groups.push({
      title: 'BullMQ',
      keys: [
        { name: 'BULL_BOARD_USER', prop: 'bullBoardUser' },
        { name: 'BULL_BOARD_PASS', prop: 'bullBoardPassword' },
        { name: 'QUEUE_PREFIX', prop: 'queuePrefix' },
      ],
    });
  }

  if (config.upload === 'multer') {
    groups.push({
      title: 'File upload (S3 bucket)',
      keys: [
        { name: 'BUCKET_ENDPOINT', prop: 'bucket_endpoint' },
        { name: 'BUCKET_REGION', prop: 'bucket_region' },
        { name: 'BUCKET_ACCESSID', prop: 'bucket_accessId' },
        { name: 'BUCKET_SECRETKEY', prop: 'bucket_secretKey' },
        { name: 'BUCKET_NAME', prop: 'bucket_name' },
      ],
    });
  }

  return groups;
}

// ── env.js ──────────────────────────────────────────

function jsLine(key: EnvKey): string {
  const base = `process.env.${key.name}`;
  if (key.default === undefined) return `  ${key.prop}: ${base},`;
  const fallback = typeof key.default === 'number' ? String(key.default) : `'${key.default}'`;
  return `  ${key.prop}: ${base} || ${fallback},`;
}

function renderEnvJs(groups: EnvGroup[]): string {
  const body = groups
    .map((g) => `  // ${g.title}\n${g.keys.map(jsLine).join('\n')}`)
    .join('\n\n');
  return `import 'dotenv/config';\n\nexport const env = {\n${body}\n};\n`;
}

// ── .env files ──────────────────────────────────────

type Mode = 'dev' | 'example' | 'production';

function randomSecret(): string {
  return crypto.randomBytes(32).toString('hex'); // 64 random characters
}

function envValue(key: EnvKey, mode: Mode): string {
  if (key.name === 'NODE_ENV' && mode === 'production') return 'production';
  if (key.secret) return mode === 'example' ? '' : randomSecret();
  if (key.fill !== undefined) return key.fill;
  return key.default !== undefined ? String(key.default) : '';
}

function renderDotenv(groups: EnvGroup[], mode: Mode): string {
  return (
    groups
      .map((g) => `# ${g.title}\n${g.keys.map((k) => `${k.name}=${envValue(k, mode)}`).join('\n')}`)
      .join('\n\n') + '\n'
  );
}

export async function generateEnvFiles(config: ProjectConfig, targetDir: string): Promise<void> {
  const groups = buildGroups(config);

  await mkdir(path.join(targetDir, 'src', 'config'), { recursive: true });
  await writeFile(path.join(targetDir, 'src', 'config', 'env.js'), renderEnvJs(groups));
  await writeFile(path.join(targetDir, '.env'), renderDotenv(groups, 'dev'));
  await writeFile(path.join(targetDir, '.env.example'), renderDotenv(groups, 'example'));
  await writeFile(path.join(targetDir, '.env.production'), renderDotenv(groups, 'production'));
}