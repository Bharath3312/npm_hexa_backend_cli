import { logger } from "../config/logger.js";
// import { sendMail } from "./handlers/mail.handler.js";
import QueueRegistry from "./queue.registry.js";
import WorkerRegistry from "./worker.registry.js";


export async function startAll() {
    // QueueRegistry.register('mail',{
    //     attempts: 5,
    //     backoff: { type: 'exponential', delay: 3000 },
    //     removeOnComplete: 100,
    //     removeOnFail: 100,
    // })

    // WorkerRegistry.registerWorker('mail',sendMail ,{ concurrency: 3 })
}


export async function stopAll() {
     logger.info('Stopping BullMQ...');
    await Promise.all(WorkerRegistry.getAllWorkers().map((w) => w.close()));
    await Promise.all(QueueRegistry.getAllQueues().map((q) => q.close()));
      logger.info('BullMQ stopped');

}