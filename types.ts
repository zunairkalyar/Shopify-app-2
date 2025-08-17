
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