
export type WaStatus = 'ready' | 'pairing' | 'down';

export type WaDeliveryReceipt = {
    providerMsgId: string;
    status: 'delivered' | 'read' | 'failed';
    error?: string;
};

export type WaInboundMessage = {
    from: string; // E.164 format
    text: string;
    providerMsgId?: string;
};

export interface WaProvider {
    init(sessionId: string): Promise<void>;
    getStatus(): WaStatus;
    getQrCode(): string | null;
    sendText(toE164: string, text: string, meta: { shopId: string; messageId: string }): Promise<{ providerMsgId: string }>;
    onDelivery(cb: (receipt: WaDeliveryReceipt) => void): void;
    onInbound(cb: (message: WaInboundMessage) => void): void;
    onStatusChange(cb: (status: WaStatus) => void): void;
}
