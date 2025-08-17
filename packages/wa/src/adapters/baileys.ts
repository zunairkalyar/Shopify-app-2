
import makeWASocket, { DisconnectReason, useMultiFileAuthState, WAMessage } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { WaProvider, WaStatus, WaDeliveryReceipt, WaInboundMessage } from '../provider';
import { env } from '@orderalert-clone/config';
import * as path from 'path';
import pino from 'pino';

// Suppress Baileys' verbose logging
const logger = pino({ level: 'silent' });

export class BaileysProvider implements WaProvider {
    private socket: any;
    private status: WaStatus = 'down';
    private qr: string | null = null;
    private sessionId: string = 'default-session';

    private deliveryCallback?: (receipt: WaDeliveryReceipt) => void;
    private inboundCallback?: (message: WaInboundMessage) => void;
    private statusChangeCallback?: (status: WaStatus) => void;

    async init(sessionId: string): Promise<void> {
        this.sessionId = sessionId;
        const sessionPath = path.join(env.WA_STORE_DIR, this.sessionId);
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        
        this.socket = makeWASocket({
            auth: state,
            printQRInTerminal: env.NODE_ENV === 'development',
            logger,
        });

        this.socket.ev.on('connection.update', (update: any) => {
            const { connection, lastDisconnect, qr } = update;
            this.qr = qr ?? null;

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                this.updateStatus('down');
                console.error('Connection closed:', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
                if (shouldReconnect) {
                    // Reconnect logic would be here
                } else {
                    console.error('Not reconnecting, session logged out.');
                }
            } else if (connection === 'open') {
                this.updateStatus('ready');
                this.qr = null;
            } else if (qr) {
                this.updateStatus('pairing');
            }
        });

        this.socket.ev.on('creds.update', saveCreds);

        // TODO: Implement listeners for inbound messages and delivery receipts
    }
    
    private updateStatus(newStatus: WaStatus) {
        if (this.status !== newStatus) {
            this.status = newStatus;
            console.log(`[BaileysProvider] Status changed to: ${newStatus}`);
            if (this.statusChangeCallback) {
                this.statusChangeCallback(newStatus);
            }
        }
    }
    
    getStatus(): WaStatus {
        return this.status;
    }
    
    getQrCode(): string | null {
        return this.qr;
    }
    
    async sendText(toE164: string, text: string, meta: { shopId: string; messageId: string; }): Promise<{ providerMsgId: string; }> {
        if (this.status !== 'ready') {
            throw new Error('WhatsApp provider is not ready.');
        }
        // Baileys requires JID format (e.g., 923001234567@s.whatsapp.net)
        const jid = `${toE164.replace('+', '')}@s.whatsapp.net`;
        const result = await this.socket.sendMessage(jid, { text });
        if (!result?.key?.id) {
            throw new Error('Failed to send message, no message ID returned.');
        }
        return { providerMsgId: result.key.id };
    }
    
    onDelivery(cb: (receipt: WaDeliveryReceipt) => void): void {
        this.deliveryCallback = cb;
    }
    
    onInbound(cb: (message: WaInboundMessage) => void): void {
        this.inboundCallback = cb;
    }
    
    onStatusChange(cb: (status: WaStatus) => void): void {
        this.statusChangeCallback = cb;
    }
}
