import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

let client;
let bullProducerConnection;

function buildClient() {
  const options = {
    maxRetriesPerRequest: null, // required by BullMQ; must be in ONE options object
    enableReadyCheck: false,
    lazyConnect: true,
  };

  return env.redisUrl
    ? new Redis(env.redisUrl, options)
    : new Redis({
        host: env.redisHost || '127.0.0.1',
        port: Number(env.redisPort || 6379),
        password: env.redisPassword || undefined,
        ...options,
      });
}

export function getRedis() {
  if (!client) {
    client = buildClient();
    client.on('error', (err) => logger.error('Redis error', { err }));
    client.on('connect', () => logger.info('Redis connected'));
    client.on('close', () => logger.warn('Redis connection closed'));
  }
  return client;
}

export async function initRedis() {
  const r = getRedis();
  try {
    await r.connect();
    await r.ping();
    logger.info('Redis ready');
    return true;
  } catch (err) {
    logger.warn('Redis not available at startup', { err });
    return false;
  }
}

export async function closeRedis() {
  if (bullProducerConnection) {
    try {
      await bullProducerConnection.quit();
      logger.info('Redis producer connection closed');
    } catch (err) {
      logger.warn('Redis producer quit failed', { err });
      bullProducerConnection.disconnect();
    }
    bullProducerConnection = null;
  }

  if (client) {
    try {
      await client.quit();
      logger.info('Redis base connection closed');
    } catch (err) {
      logger.warn('Redis base quit failed', { err });
      client.disconnect();
    }
    client = null;
  }
}

// Dedicated connection per BullMQ Worker — never hand them the shared client.
export function createBullConnection() {
  return getRedis().duplicate();
}

export function getBullProducerConnection() {
  if (!bullProducerConnection) {
    bullProducerConnection = getRedis().duplicate();
  }
  return bullProducerConnection; // same connection reused for ALL queues
}

export async function withRedis(fn, fallback) {
  try {
    return await fn(getRedis());
  } catch (err) {
    logger.warn('Redis operation failed, using fallback', { err });
    return typeof fallback === 'function' ? fallback() : fallback;
  }
}