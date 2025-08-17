
import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyShopifyHmac } from '@orderalert-clone/core/utils';
import { env } from '@orderalert-clone/config';
import { DoneFuncWithErrOrRes } from 'fastify/types/hooks';

export function verifyShopifyWebhook(request: FastifyRequest, reply: FastifyReply, done: DoneFuncWithErrOrRes) {
  const hmac = request.headers['x-shopify-hmac-sha256'] as string;

  if (!hmac) {
    request.log.warn('HMAC verification failed: Missing HMAC header');
    return reply.code(401).send({ error: 'Missing HMAC header' });
  }

  // The rawBody is attached by the @fastify/raw-body plugin
  const rawBody = (request as any).rawBody;
  if (!rawBody) {
    request.log.error('HMAC verification failed: Missing raw body');
    return reply.code(400).send({ error: 'Missing raw body for HMAC verification' });
  }

  const isValid = verifyShopifyHmac(env.SHOPIFY_APP_SECRET, Buffer.from(rawBody), hmac);

  if (!isValid) {
    request.log.warn('HMAC verification failed: Invalid signature');
    return reply.code(403).send({ error: 'Invalid HMAC signature' });
  }

  done();
}
