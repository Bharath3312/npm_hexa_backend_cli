import { Worker } from 'bullmq';
import { createBullConnection } from '../config/redis.js';
import { logger } from '../config/logger.js';

class WorkerRegistry {
  static workers = {};
  static options = {
        concurrency: 5, // Process up to 5 orders concurrently
  }
  static createWorker(queueName, processor, options = this.options) {
    try {
      const worker = new Worker(queueName, processor, {
        connection: createBullConnection(),
        ...options,
      });
      worker.on('completed', (job) => logger.info(`${queueName} job ${job.id} completed`));
      worker.on('failed', (job, err) => {
        logger.error(`${queueName} job ${job?.id} failed`, { err });
        console.log(err,"err");
    });
      worker.on('error', (err) => logger.error(`${queueName} worker error`, { err }));
      return worker;
    } catch (err) {
      logger.error(`Failed to create worker for ${queueName}`, { err });
      return null;
    }
  }

  static registerWorker(queueName, handlers, options = null) {
    if (!this.workers[queueName]) {
      const processor = async (job) => {
        let handler;

        if (
          typeof handlers === 'object' &&
          handlers !== null
        ) {
          handler = handlers[job.name];

          if (!handler) {
            throw new Error(
              `No handler registered for job "${job.name}" in queue "${queueName}"`
            );
          }
        } else if (typeof handlers === 'function') {
          handler = handlers;
        } else {
          throw new Error(
            `Invalid handlers for queue "${queueName}"`
          );
        }

        return handler(job);
      };

      const worker = this.createWorker(
        queueName,
        processor,
        options
      );

      if (!worker) return null;

      this.workers[queueName] = worker;
    }

    return this.workers[queueName];
  }

  static getAllWorkers() {
    return Object.values(this.workers);
  }
}

export default WorkerRegistry;