
import { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma';
import { webhookEventsQueue } from '../queues';
import { verifyShopifyWebhook } from '../middleware/verifyShopifyWebhook';
import { ShopifyWebhookTopic, NormalizedEvent } from '@orderalert-clone/core/types';
import cuid from 'cuid';

interface ShopifyWebhookRequest extends FastifyRequest {
    rawBody: string; // From @fastify/raw-body
}

export async function webhookRoutes(fastify: FastifyInstance) {
  
  const handler = async (request: ShopifyWebhookRequest, reply: any) => {
    const topic = request.headers['x-shopify-topic'] as ShopifyWebhookTopic;
    const shopDomain = request.headers['x-shopify-shop-domain'] as string;
    const webhookId = request.headers['x-shopify-webhook-id'] as string;
    const hmac = request.headers['x-shopify-hmac-sha256'] as string;
    const rawPayload = request.body;

    if (!topic || !shopDomain || !webhookId) {
        fastify.log.warn({ headers: request.headers }, 'Webhook received with missing Shopify headers');
        return reply.code(400).send({ error: 'Missing required Shopify headers' });
    }

    // Idempotency check: has this webhook ID been processed before?
    const existingEvent = await prisma.event.findUnique({ where: { webhookId } });
    if (existingEvent) {
        fastify.log.info(`Duplicate webhook received and ignored: ${webhookId}`);
        return reply.code(200).send({ message: 'OK (duplicate)' });
    }

    const shop = await prisma.shop.findUnique({ where: { domain: shopDomain } });
    if (!shop) {
        fastify.log.error(`Webhook for unknown shop received: ${shopDomain}`);
        return reply.code(404).send({ error: `Shop not found: ${shopDomain}` });
    }

    // Store the raw event for auditing and reprocessing
    await prisma.event.create({
        data: {
            shopId: shop.id,
            topic,
            webhookId,
            hmac,
            raw: rawPayload as any,
            occurredAt: new Date(),
        },
    });

    // Create a normalized event to add to the queue
    const eventToQueue: NormalizedEvent = {
        id: cuid(),
        webhookId,
        topic,
        shopDomain,
        occurredAt: new Date().toISOString(),
        rawPayload,
    };

    // Add the job to the queue for background processing
    await webhookEventsQueue.add('process-event', eventToQueue, {
        jobId: webhookId, // Use webhookId for BullMQ's own idempotency
    });
    
    fastify.log.info(`Webhook enqueued: ${webhookId} for ${shopDomain}`);
    reply.code(202).send({ message: 'Accepted' });
  };
  
  const webhookOpts = {
    preHandler: [verifyShopifyWebhook],
    config: {
        rawBody: true // Tell fastify-raw-body to parse this route
    }
  };

  fastify.post('/orders/create', webhookOpts, handler);
  fastify.post('/orders/updated', webhookOpts, handler);
  fastify.post('/orders/cancelled', webhookOpts, handler);
  fastify.post('/fulfillments/create', webhookOpts, handler);
}
