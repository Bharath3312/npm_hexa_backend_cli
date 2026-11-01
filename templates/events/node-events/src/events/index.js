import { EventEmitter } from 'node:events';

class AppEventEmitter extends EventEmitter {}

export const appEvents = new AppEventEmitter();

// increase max listeners if you have many
appEvents.setMaxListeners(15);
