import { Queue } from 'bullmq';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { getBullProducerConnection } from '../config/redis.js';

class QueueRegistry {
  static queues = {};

  static defaultJobOptions = {
    removeOnComplete: 50,
    removeOnFail: 50,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  };

  static register(queueName, options = QueueRegistry.defaultJobOptions) {
    try {
      const scopedName = `${env.queuePrefix}_${queueName}`;
      const queue = new Queue(scopedName, {
        connection: getBullProducerConnection(),
        defaultJobOptions: options, // now actually uses what's passed in
      });
      queue.on('error', (err) => logger.error(`${queueName} queue error`, { err }));
      QueueRegistry.queues[queueName] = queue;
      return queue;
    } catch (err) {
      logger.error(`Failed to create queue ${queueName}`, { err });
      return null;
    }
  }

  static getQueue(queueName, options = QueueRegistry.defaultJobOptions) {
    if (!QueueRegistry.queues[queueName]) {
      const queue = QueueRegistry.register(queueName, options);
      if (!queue) return null;
      //   this.queues[queueName] = queue;
    }
    return QueueRegistry.queues[queueName];
  }

  static getAllQueues() {
    return Object.values(QueueRegistry.queues);
  }
}

export default QueueRegistry;
