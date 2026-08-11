import { Queue } from 'bullmq';
import { getBullProducerConnection } from '../config/redis.js';
import { logger } from '../config/logger.js';

class QueueRegistry {
  static queues = {};

  static defaultJobOptions = {
    removeOnComplete: 50,
    removeOnFail: 50,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  };

  static register(queueName, options = this.defaultJobOptions) {
    try {
      const queue = new Queue(queueName, {
        connection: getBullProducerConnection(),
        defaultJobOptions: options, // now actually uses what's passed in
      });
      queue.on('error', (err) => logger.error(`${queueName} queue error`, { err }));
      this.queues[queueName] = queue;
      return queue;
    } catch (err) {
      logger.error(`Failed to create queue ${queueName}`, { err });
      return null;
    }
  }

  static getQueue(queueName, options=this.defaultJobOptions) {
    if (!this.queues[queueName]) {
      const queue = this.register(queueName, options);
      if (!queue) return null;
    //   this.queues[queueName] = queue;
    }
    return this.queues[queueName];
  }

  static getAllQueues() {
    return Object.values(this.queues);
  }
}

export default QueueRegistry;