import { Queue } from 'bullmq';
import { env } from '@orderalert-clone/config';
import { URL } from 'url';

const redisUrl = new URL(env.REDIS_URL);
const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port, 10),
};

export const WEBHOOK_EVENTS_QUEUE = 'webhook-events';
export const MESSAGE_SEND_QUEUE = 'message-send';

export const webhookEventsQueue = new Queue(WEBHOOK_EVENTS_QUEUE, { connection });
export const messageSendQueue = new Queue(MESSAGE_SEND_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
  },
});