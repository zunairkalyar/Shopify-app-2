
export type ShopifyWebhookTopic = 'orders/create' | 'orders/updated' | 'orders/cancelled' | 'fulfillments/create';

// This represents the data we add to our queue for processing
export type NormalizedEvent = {
  id: string; // cuid
  webhookId: string; // from header
  topic: ShopifyWebhookTopic;
  shopDomain: string;
  occurredAt: string; // ISO string
  rawPayload: any; // original payload
};
