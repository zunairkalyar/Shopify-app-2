
import { Job } from 'bullmq';
import { PrismaClient } from '@orderalert-clone/db';
import { BaileysProvider } from '@orderalert-clone/wa/adapters/baileys';
import Handlebars from 'handlebars';

const prisma = new PrismaClient();
// In a real multi-tenant app, you would manage a pool of providers,
// one for each connected shop/session.
const waProvider = new BaileysProvider(); 
waProvider.init('default-session').catch(console.error);

interface SendMessageJobData {
    shopId: string;
    toPhone: string;
    templateKey: string;
    vars: Record<string, any>;
}

export async function sendWhatsAppMessage(job: Job<SendMessageJobData>) {
  const { shopId, toPhone, templateKey, vars } = job.data;
  
  const template = await prisma.template.findFirst({
      where: { key: templateKey, OR: [{ shopId }, { shopId: null }] },
      orderBy: { shopId: 'desc' } // Prefer shop-specific template over default
  });

  if (!template || !template.active) {
      throw new Error(`Template ${templateKey} not found or is inactive for shop ${shopId}`);
  }

  const compiledTemplate = Handlebars.compile(template.body, { noEscape: true, strict: true });
  const bodyText = compiledTemplate(vars);

  const message = await prisma.message.create({
      data: {
          shopId,
          toPhone,
          templateKey,
          bodyText,
          vars,
          status: 'sending',
      }
  });

  try {
      console.log(`Sending message ${message.id} to ${toPhone}`);
      const { providerMsgId } = await waProvider.sendText(toPhone, bodyText, { shopId, messageId: message.id });
      await prisma.message.update({
          where: { id: message.id },
          data: { status: 'sent', sentAt: new Date(), providerMsgId }
      });
      console.log(`Message ${message.id} sent successfully. Provider ID: ${providerMsgId}`);
  } catch (error: any) {
      console.error(`Failed to send message ${message.id}:`, error.message);
      await prisma.message.update({
          where: { id: message.id },
          data: { status: 'failed', error: error.message }
      });
      throw error; // Re-throw to make the job fail and allow for BullMQ retries
  }
}
