
export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  financialStatus: 'cod' | 'paid' | 'refunded';
  fulfillmentStatus: 'fulfilled' | 'unfulfilled' | 'partial';
  total: number;
  currency: string;
  trackingUrl?: string;
  createdAt: string;
}

export enum MessageStatus {
  Queued = "queued",
  Sent = "sent",
  Delivered = "delivered",
  Read = "read",
  Failed = "failed",
}

export interface Message {
  id: string;
  toPhone: string;
  templateKey: string;
  bodyText: string;
  status: MessageStatus;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  error?: string;
}

export interface Template {
  key: string;
  locale: string;
  body: string;
  variables: string[];
  active: boolean;
  isDefault?: boolean;
}

export interface Settings {
  businessHours: { start: string; end: string };
  confirmDelayMin: number;
  abandonedDelayMin: number;
  optOutKeywords: string[];
}

export type WaStatus = 'ready' | 'pairing' | 'down';

export interface TopTemplate {
    key: string;
    count: number;
}

export interface DashboardStats {
  messagesSentToday: number;
  failures: number;
  queueDepth: number;
  revenueGenerated: number;
  chartData: { name: string; sent: number; failed: number }[];
}

export interface StoreConnection {
  domain: string;
  status: 'connected' | 'disconnected';
  connectedAt?: string;
}

export interface StoreLog {
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  createdAt: string;
}

// --- New Webhook Types ---

export interface Webhook {
  id: string;
  timestamp: string;
  source: 'shopify';
  eventType: 'order_created' | 'order_fulfilled' | 'order_cancelled';
  status: 'processed' | 'failed';
  orderId: string;
  customer: { name: string; email: string; phone: string };
  totalAmount: string;
  processingTimeMs: number;
  messagesGenerated: {
    whatsapp: '✅ Generated' | '❌ Skipped' | '⚠️ Failed';
    email: '✅ Generated' | '❌ Skipped' | '⚠️ Failed';
    sms: '✅ Generated' | '❌ Skipped' | '⚠️ Failed';
  };
  errorDetails: string | null;
}

export interface WebhookStats {
  processedToday: number;
  failedToday: number;
  avgProcessingTime: number;
  successRate: number;
  chartData: { name: string; processed: number; failed: number }[];
}

export interface WebhookConfig {
  webhookUrls: {
    shopifyStoreUrl: string;
    endpoints: {
      order_create: 'enabled' | 'disabled';
      order_fulfilled: 'enabled' | 'disabled';
      order_cancelled: 'enabled' | 'disabled';
    };
  };
  messageSettings: {
    whatsappEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    businessName: string;
    supportPhone: string;
  };
}
