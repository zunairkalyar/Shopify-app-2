
import { Order, Message, Template, Settings, WaStatus, MessageStatus, DashboardStats, TopTemplate, StoreConnection, StoreLog, Webhook, WebhookStats, WebhookConfig } from '../types';

const mockOrders: Order[] = [
  { id: 'ord_1', orderNumber: 1027, customerName: 'Ayesha Khan', customerPhone: '+923001234567', financialStatus: 'cod', fulfillmentStatus: 'unfulfilled', total: 2899.00, currency: 'PKR', createdAt: '2023-10-27T10:00:00Z' },
  { id: 'ord_2', orderNumber: 1028, customerName: 'Bilal Ahmed', customerPhone: '+923217654321', financialStatus: 'paid', fulfillmentStatus: 'fulfilled', total: 1500.50, currency: 'PKR', trackingUrl: 'https://tracking.example.com/123', createdAt: '2023-10-27T11:30:00Z' },
  { id: 'ord_3', orderNumber: 1029, customerName: 'Fatima Ali', customerPhone: '+923339876543', financialStatus: 'cod', fulfillmentStatus: 'unfulfilled', total: 4500.00, currency: 'PKR', createdAt: '2023-10-28T09:15:00Z' },
  { id: 'ord_4', orderNumber: 1030, customerName: 'Usman Sharif', customerPhone: '+923123456789', financialStatus: 'paid', fulfillmentStatus: 'partial', total: 999.00, currency: 'PKR', createdAt: '2023-10-28T14:00:00Z' },
  { id: 'ord_5', orderNumber: 1031, customerName: 'Sana Javed', customerPhone: '+923456789012', financialStatus: 'refunded', fulfillmentStatus: 'fulfilled', total: 1250.00, currency: 'PKR', createdAt: '2023-10-26T18:45:00Z' },
];

const mockMessages: Message[] = [
  { id: 'msg_1', toPhone: '+923001234567', templateKey: 'order_created_v1', bodyText: 'Thanks, Ayesha! Your order #1027 (PKR 2899.00) is in.', status: MessageStatus.Delivered, createdAt: '2023-10-27T10:01:00Z', sentAt: '2023-10-27T10:01:05Z', deliveredAt: '2023-10-27T10:01:10Z' },
  { id: 'msg_2', toPhone: '+923217654321', templateKey: 'order_dispatched_v1', bodyText: 'Good news! Order #1028 is on the way.', status: MessageStatus.Read, createdAt: '2023-10-27T11:35:00Z', sentAt: '2023-10-27T11:35:05Z', deliveredAt: '2023-10-27T11:35:20Z', readAt: '2023-10-27T12:00:00Z' },
  { id: 'msg_3', toPhone: '+923339876543', templateKey: 'order_created_v1', bodyText: 'Thanks, Fatima! Your order #1029 (PKR 4500.00) is in.', status: MessageStatus.Sent, createdAt: '2023-10-28T09:16:00Z', sentAt: '2023-10-28T09:16:05Z' },
  { id: 'msg_4', toPhone: '+923001234567', templateKey: 'order_confirm_v1', bodyText: 'Please confirm order #1027. Reply 1 to confirm, 2 to cancel.', status: MessageStatus.Queued, createdAt: '2023-10-27T12:01:00Z' },
  { id: 'msg_5', toPhone: '+923123456789', templateKey: 'order_created_v1', bodyText: 'Thanks, Usman! Your order #1030 (PKR 999.00) is in.', status: MessageStatus.Failed, error: 'Invalid phone number format', createdAt: '2023-10-28T14:01:00Z' },
];

const mockTemplates: Template[] = [
    { key: 'order_created_v1', locale: 'en', body: 'Thanks, {{first_name}}! Your order #{{order_id}} ({{currency}} {{total}}) is in. We’ll update you here. Reply HELP for support.', variables: ['first_name', 'order_id', 'total', 'currency'], active: true, isDefault: true },
    { key: 'order_confirm_v1', locale: 'en', body: 'Please confirm order #{{order_id}}. Reply 1 to confirm, 2 to cancel.', variables: ['order_id'], active: true, isDefault: true },
    { key: 'order_dispatched_v1', locale: 'en', body: 'Good news! Order #{{order_id}} is on the way. Track: {{tracking_url}}', variables: ['order_id', 'tracking_url'], active: true, isDefault: true },
    { key: 'order_cancelled_v1', locale: 'en', body: 'We’re sorry—order #{{order_id}} was cancelled. If this seems wrong, reply HELP.', variables: ['order_id'], active: true, isDefault: true },
    { key: 'abandoned_cart_v1', locale: 'en', body: 'Still thinking it over? Your items are waiting: {{cart_link}}. Reply STOP to opt out.', variables: ['cart_link'], active: true, isDefault: true },
    { key: 'custom_promo_v2', locale: 'en', body: 'Hi {{first_name}}, special offer just for you! Use code PROMO15 for 15% off.', variables: ['first_name'], active: false, isDefault: false },
];

let mockSettings: Settings = {
  businessHours: { start: '09:00', end: '21:00' },
  confirmDelayMin: 120,
  abandonedDelayMin: 60,
  optOutKeywords: ['STOP', 'UNSUBSCRIBE', 'CANCEL'],
};

let mockWaStatus: WaStatus = 'ready';

let mockStoreConnection: StoreConnection = {
  domain: '',
  status: 'disconnected',
};

const mockLogs: StoreLog[] = [
    { id: 'log_1', level: 'info', message: 'Store connection successful for your-store.myshopify.com.', createdAt: '2023-10-29T10:05:00Z' },
    { id: 'log_2', level: 'info', message: 'Webhook received: orders/create (ID: wh_abc123)', createdAt: '2023-10-29T10:15:22Z' },
    { id: 'log_3', level: 'info', message: 'Webhook received: orders/create (ID: wh_def456)', createdAt: '2023-10-29T10:18:45Z' },
    { id: 'log_4', level: 'error', message: 'Failed to validate webhook signature for ID: wh_ghi789.', createdAt: '2023-10-29T10:20:10Z' },
    { id: 'log_5', level: 'info', message: 'Webhook received: fulfillments/create (ID: wh_jkl012)', createdAt: '2023-10-29T11:01:00Z' },
];

// --- NEW MOCK DATA FOR WEBHOOKS ---
const mockWebhooks: Webhook[] = [
    { id: "wh_123456789", timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(), source: "shopify", eventType: "order_created", status: "processed", orderId: "#1031", customer: { name: "Sana Javed", email: "sana@example.com", phone: "+923456789012" }, totalAmount: "PKR 1,250.00", processingTimeMs: 45, messagesGenerated: { whatsapp: "✅ Generated", email: "✅ Generated", sms: "❌ Skipped" }, errorDetails: null },
    { id: "wh_abcdefghi", timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), source: "shopify", eventType: "order_created", status: "processed", orderId: "#1030", customer: { name: "Usman Sharif", email: "usman@example.com", phone: "+923123456789" }, totalAmount: "PKR 999.00", processingTimeMs: 62, messagesGenerated: { whatsapp: "✅ Generated", email: "✅ Generated", sms: "❌ Skipped" }, errorDetails: null },
    { id: "wh_jklmnopqr", timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), source: "shopify", eventType: "order_fulfilled", status: "processed", orderId: "#1028", customer: { name: "Bilal Ahmed", email: "bilal@example.com", phone: "+923217654321" }, totalAmount: "PKR 1,500.50", processingTimeMs: 38, messagesGenerated: { whatsapp: "✅ Generated", email: "❌ Skipped", sms: "❌ Skipped" }, errorDetails: null },
    { id: "wh_stuvwxyz", timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), source: "shopify", eventType: "order_created", status: "failed", orderId: "#1029", customer: { name: "Fatima Ali", email: "fatima@example.com", phone: "+923339876543" }, totalAmount: "PKR 4,500.00", processingTimeMs: 150, messagesGenerated: { whatsapp: "⚠️ Failed", email: "⚠️ Failed", sms: "❌ Skipped" }, errorDetails: "Invalid customer phone number format" },
    { id: "wh_012345678", timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), source: "shopify", eventType: "order_cancelled", status: "processed", orderId: "#1027", customer: { name: "Ayesha Khan", email: "ayesha@example.com", phone: "+923001234567" }, totalAmount: "PKR 2,899.00", processingTimeMs: 55, messagesGenerated: { whatsapp: "✅ Generated", email: "✅ Generated", sms: "❌ Skipped" }, errorDetails: null },
];

let mockWebhookConfig: WebhookConfig = {
    webhookUrls: {
        shopifyStoreUrl: "your-store.myshopify.com",
        endpoints: {
            order_create: "enabled",
            order_fulfilled: "enabled",
            order_cancelled: "disabled",
        },
    },
    messageSettings: {
        whatsappEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        businessName: "OrderAlert Store",
        supportPhone: "+923001234567",
    },
};

// --- API Functions ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getDashboardStats = async (): Promise<DashboardStats> => {
  await delay(500);
  return {
    messagesSentToday: 152,
    failures: 3,
    queueDepth: 12,
    revenueGenerated: 45600,
    chartData: [
        { name: 'Mon', sent: 120, failed: 1 },
        { name: 'Tue', sent: 130, failed: 0 },
        { name: 'Wed', sent: 110, failed: 2 },
        { name: 'Thu', sent: 140, failed: 1 },
        { name: 'Fri', sent: 180, failed: 0 },
        { name: 'Sat', sent: 210, failed: 3 },
        { name: 'Sun', sent: 190, failed: 1 },
    ],
  };
};

export const getOrders = async (): Promise<Order[]> => {
  await delay(700);
  return mockOrders;
};

export const getMessages = async (): Promise<Message[]> => {
  await delay(600);
  return mockMessages;
};

export const resendMessage = async (messageId: string): Promise<{ success: boolean }> => {
    await delay(500);
    console.log(`Resending message ${messageId}`);
    return { success: true };
}

export const getTemplates = async (): Promise<Template[]> => {
  await delay(400);
  return mockTemplates;
};

export const saveTemplate = async (template: Template): Promise<Template> => {
    await delay(500);
    const index = mockTemplates.findIndex(t => t.key === template.key);
    if (index > -1) {
        mockTemplates[index] = template;
    } else {
        mockTemplates.push(template);
    }
    return template;
};

export const getSettings = async (): Promise<Settings> => {
  await delay(300);
  return mockSettings;
};

export const saveSettings = async (settings: Settings): Promise<Settings> => {
  await delay(800);
  mockSettings = settings;
  return mockSettings;
};

export const getWaStatus = async (): Promise<{ status: WaStatus }> => {
  await delay(200);
  const statuses: WaStatus[] = ['ready', 'down', 'pairing'];
  const currentIndex = statuses.indexOf(mockWaStatus);
  mockWaStatus = statuses[(currentIndex + 1) % statuses.length];
  return { status: mockWaStatus };
};

export const getWaQrCode = async (): Promise<{ qr: string }> => {
    await delay(1000);
    return { qr: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=https://example.com/pair?t=${Date.now()}` };
};

export const getRecentMessages = async (): Promise<Message[]> => {
    await delay(450);
    return [...mockMessages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
}

export const getTopTemplates = async (): Promise<TopTemplate[]> => {
    await delay(350);
    const counts = mockMessages.reduce((acc, msg) => {
        acc[msg.templateKey] = (acc[msg.templateKey] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
};

export const getStoreConnection = async (): Promise<StoreConnection> => {
    await delay(300);
    return mockStoreConnection;
};

export const connectStore = async (domain: string): Promise<StoreConnection> => {
    await delay(1500);
    if (!domain.endsWith('.myshopify.com')) {
        throw new Error('Invalid Shopify domain.');
    }
    mockStoreConnection = {
        domain,
        status: 'connected',
        connectedAt: new Date().toISOString(),
    };
    return mockStoreConnection;
};

export const disconnectStore = async (): Promise<StoreConnection> => {
    await delay(500);
    mockStoreConnection = {
        domain: '',
        status: 'disconnected',
    };
    return mockStoreConnection;
};

export const getStoreLogs = async (): Promise<StoreLog[]> => {
    await delay(650);
    return [...mockLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// --- NEW WEBHOOK API FUNCTIONS ---

export const getWebhooks = async (): Promise<Webhook[]> => {
    await delay(750);
    // Add a new random webhook to simulate live updates
    if (Math.random() > 0.7) {
        const newOrder = mockOrders[Math.floor(Math.random() * mockOrders.length)];
        mockWebhooks.unshift({
             id: `wh_${Math.random().toString(36).substr(2, 9)}`,
             timestamp: new Date().toISOString(),
             source: "shopify",
             eventType: "order_created",
             status: "processed",
             orderId: `#${newOrder.orderNumber}`,
             customer: { name: newOrder.customerName, email: "customer@example.com", phone: newOrder.customerPhone },
             totalAmount: `PKR ${newOrder.total.toFixed(2)}`,
             processingTimeMs: Math.floor(Math.random() * 50) + 20,
             messagesGenerated: { whatsapp: "✅ Generated", email: "❌ Skipped", sms: "❌ Skipped" },
             errorDetails: null
        });
    }
    return [...mockWebhooks].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getWebhookStats = async (): Promise<WebhookStats> => {
    await delay(400);
    const processedToday = mockWebhooks.filter(wh => wh.status === 'processed').length;
    const failedToday = mockWebhooks.filter(wh => wh.status === 'failed').length;
    return {
        processedToday,
        failedToday,
        avgProcessingTime: 52,
        successRate: 98.5,
        chartData: [
            { name: 'Mon', processed: 180, failed: 2 },
            { name: 'Tue', processed: 210, failed: 1 },
            { name: 'Wed', processed: 190, failed: 5 },
            { name: 'Thu', processed: 220, failed: 0 },
            { name: 'Fri', processed: 250, failed: 3 },
            { name: 'Sat', processed: 310, failed: 2 },
            { name: 'Sun', processed: 280, failed: 1 },
        ],
    };
};

export const getWebhookConfig = async (): Promise<WebhookConfig> => {
    await delay(300);
    return mockWebhookConfig;
};

export const saveWebhookConfig = async (config: WebhookConfig): Promise<WebhookConfig> => {
    await delay(800);
    mockWebhookConfig = config;
    return mockWebhookConfig;
};

export const getTemplatePreview = async (templateBody: string, type: 'whatsapp' | 'email' | 'sms'): Promise<string> => {
    await delay(500);
    const mockData: { [key: string]: string } = {
        first_name: 'Ayesha',
        order_id: '1027',
        total: '2,899.00',
        currency: 'PKR',
        tracking_url: 'https://tracking.example.com/123',
        cart_link: 'https://shop.example.com/cart/abc'
    };
    let previewText = templateBody;
    Object.keys(mockData).forEach(variable => {
        const regex = new RegExp(`{{${variable}}}`, 'g');
        previewText = previewText.replace(regex, mockData[variable] || `[${variable}]`);
    });
    return previewText;
};
