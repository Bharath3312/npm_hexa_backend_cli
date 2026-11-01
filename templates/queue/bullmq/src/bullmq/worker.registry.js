import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { createBullConnection } from '../config/redis.js';

class WorkerRegistry {
  static workers = {};
  static options = {
    concurrency: 2, // Process up to 2 orders concurrently
    // maxStalledCount: 3, // Stalled error default 1
  };
  static createWorker(queueName, processor, options = WorkerRegistry.options) {
    try {
      const scopedName = `${env.queuePrefix}_${queueName}`; // used ONLY for BullMQ/Redis
      const worker = new Worker(scopedName, processor, {
        connection: createBullConnection(),
        ...options,
      });
      worker.on('completed', (job) => logger.info(`${queueName} job ${job.id} completed`));
      worker.on('failed', (job, err) => {
        logger.error(`${queueName} job ${job?.id} failed`, { err });
        // console.log(err, 'err');
      });
      worker.on('error', (err) => logger.error(`${queueName} worker error`, { err }));
      return worker;
    } catch (err) {
      logger.error(`Failed to create worker for ${queueName}`, { err });
      return null;
    }
  }

  static registerWorker(queueName, handlers, options = null) {
    if (!WorkerRegistry.workers[queueName]) {
      const processor = (job) => {
        let handler;

        if (typeof handlers === 'object' && handlers !== null) {
          handler = handlers[job.name];

          if (!handler) {
            throw new Error(`No handler registered for job "${job.name}" in queue "${queueName}"`);
          }
        } else if (typeof handlers === 'function') {
          handler = handlers;
        } else {
          throw new Error(`Invalid handlers for queue "${queueName}"`);
        }

        return handler(job);
      };

      const worker = WorkerRegistry.createWorker(queueName, processor, options);

      if (!worker) return null;

      WorkerRegistry.workers[queueName] = worker;
    }

    return WorkerRegistry.workers[queueName];
  }

  static getAllWorkers() {
    return Object.values(WorkerRegistry.workers);
  }
}

export default WorkerRegistry;
