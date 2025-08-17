
import { Job } from 'bullmq';
import { NormalizedEvent } from '@orderalert-clone/core/types';
import { PrismaClient } from '@orderalert-clone/db';
import { messageSendQueue } from '../queues';

const prisma = new PrismaClient();

export async function processWebhookEvent(job: Job<NormalizedEvent>) {
  const { webhookId, topic, shopDomain, rawPayload } = job.data;
  console.log(`Processing webhook ${webhookId} (${topic}) for shop: ${shopDomain}`);

  const shop = await prisma.shop.findUnique({ where: { domain: shopDomain } });
  if (!shop) throw new Error(`Shop not found: ${shopDomain}`);
  
  const customerPhone = rawPayload.customer?.phone;
  if (!customerPhone) {
      console.warn(`No phone number for order ${rawPayload.order_number}, skipping message.`);
      return;
  }
  
  let templateKey: string | null = null;
  let delay = 0; // in ms
  const vars: Record<string, any> = {
    first_name: rawPayload.customer?.first_name || 'Valued Customer',
    order_number: rawPayload.order_number,
    total: rawPayload.total_price,
    currency: rawPayload.currency,
    tracking_url: rawPayload.fulfillments?.[0]?.tracking_url,
  };
  
  switch (topic) {
    case 'orders/create':
      templateKey = 'order_created_v1';
      // If COD, schedule a confirmation message
      if (rawPayload.financial_status === 'cod') {
        const confirmDelay = 120 * 60 * 1000; // TODO: Read from shop settings
        await messageSendQueue.add('send-message', {
            shopId: shop.id,
            toPhone: customerPhone,
            templateKey: 'order_confirm_v1',
            vars: { order_number: rawPayload.order_number },
        }, { delay: confirmDelay });
        console.log(`Scheduled COD confirmation for order ${rawPayload.order_number} in ${confirmDelay/1000/60} minutes.`);
      }
      break;
    case 'fulfillments/create':
      templateKey = 'order_dispatched_v1';
      break;
    case 'orders/cancelled':
      templateKey = 'order_cancelled_v1';
      break;
  }
  
  if (templateKey) {
    await messageSendQueue.add('send-message', {
        shopId: shop.id,
        toPhone: customerPhone,
        templateKey: templateKey,
        vars: vars,
    }, { delay });
    console.log(`Queued message '${templateKey}' for order ${rawPayload.order_number}.`);
  }
}
