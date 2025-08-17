
import { FastifyInstance } from 'fastify';
import { BaileysProvider } from '@orderalert-clone/wa/adapters/baileys';

// In a real app, this should be a singleton managed by a service layer
// to handle multiple shops/sessions. For this scaffold, we'll use one.
const waProvider = new BaileysProvider();
waProvider.init('default-session').catch(err => {
    console.error("Failed to initialize WhatsApp provider:", err);
});

export async function waRoutes(fastify: FastifyInstance) {
    
    fastify.get('/status', async (request, reply) => {
        const status = waProvider.getStatus();
        return { status };
    });

    fastify.get('/qr', async (request, reply) => {
        const status = waProvider.getStatus();
        if (status === 'pairing') {
            const qr = waProvider.getQrCode();
            if (qr) {
                // In a real app, you would convert this to a data URL
                return { qrData: qr };
            }
        }
        return reply.code(404).send({ error: 'QR code not available or provider not in pairing state.' });
    });
}
