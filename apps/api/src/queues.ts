
import { Queue } from 'bullmq';
import { env } from '@orderalert-clone/config';
import { URL } from 'url';

export const WEBHOOK_EVENTS_QUEUE = 'webhook-events';

const redisUrl = new URL(env.REDIS_URL);
const redisConnection = {
    host: redisUrl.hostname,
    port: parseInt(redisUrl.port, 10),
};

export const webhookEventsQueue = new Queue(WEBHOOK_EVENTS_QUEUE, {
  connection: redisConnection,
});
