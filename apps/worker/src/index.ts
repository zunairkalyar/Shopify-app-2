import { Worker, Job } from 'bullmq';
import { env } from '@orderalert-clone/config';
import { WEBHOOK_EVENTS_QUEUE, MESSAGE_SEND_QUEUE } from './queues';
import { processWebhookEvent } from './jobs/process-webhook-event';
import { sendWhatsAppMessage } from './jobs/send-whatsapp-message';
import { URL } from 'url';

console.log('Worker starting...');

const redisUrl = new URL(env.REDIS_URL);
const redisConnection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port, 10),
};

// Worker for orchestrating incoming webhooks
const eventWorker = new Worker(WEBHOOK_EVENTS_QUEUE, processWebhookEvent, {
  connection: redisConnection,
  concurrency: 5,
});

// Worker for sending actual WhatsApp messages
const messageWorker = new Worker(MESSAGE_SEND_QUEUE, sendWhatsAppMessage, {
  connection: redisConnection,
  concurrency: 10,
  limiter: {
    max: 1,
    duration: 1500, // Rate limit to prevent being blocked
  },
});

const logEvent = (job: Job | undefined, event: string, err?: Error) => {
    if (!job) return;
    const jobId = job.id;
    const message = err ? `: ${err.message}` : '';
    console.log(`Job ${jobId} in queue ${job.queueName} ${event}${message}`);
};

eventWorker.on('completed', job => logEvent(job, 'completed'));
messageWorker.on('completed', job => logEvent(job, 'completed'));
eventWorker.on('failed', (job, err) => logEvent(job, 'failed', err));
messageWorker.on('failed', (job, err) => logEvent(job, 'failed', err));

console.log(`Worker listening for jobs on queues: ${WEBHOOK_EVENTS_QUEUE}, ${MESSAGE_SEND_QUEUE}`);