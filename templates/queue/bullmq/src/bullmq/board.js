import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import QueueRegistry from './queue.registry.js';



let serverAdapter;

export function initBullBoard() {
  serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  // pull all registered queues dynamically — no manual listing needed
  const queues = QueueRegistry.getAllQueues().map((q) => new BullMQAdapter(q));

  createBullBoard({ queues, serverAdapter });

  return serverAdapter;
}

export function getBullBoardRouter() {
  if (!serverAdapter) throw new Error('Bull Board not initialized. Call initBullBoard() first.');
  return serverAdapter.getRouter();
}