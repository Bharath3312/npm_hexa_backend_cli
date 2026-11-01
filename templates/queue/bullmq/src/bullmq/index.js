import { logger } from "../config/logger.js";
import QueueRegistry from "./queue.registry.js";
import WorkerRegistry from "./worker.registry.js";


export async function startAll() {
  // Example code
  //   QueueRegistry.register(QUEUE_CONFIGS.MAIL.name, QUEUE_CONFIGS.MAIL.queueOptions);
  // WorkerRegistry.registerWorker(
  //   QUEUE_CONFIGS.MAIL.name,
  //   sendMail,
  //   QUEUE_CONFIGS.MAIL.workerOptions,
  // );

}


export async function stopAll() {
     logger.info('Stopping BullMQ...');
    await Promise.all(WorkerRegistry.getAllWorkers().map((w) => w.close()));
    await Promise.all(QueueRegistry.getAllQueues().map((q) => q.close()));
      logger.info('BullMQ stopped');

}