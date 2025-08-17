/// <reference types="node" />

import Fastify from 'fastify';
import rawBody from '@fastify/raw-body';
import { env } from '@orderalert-clone/config';
import { webhookRoutes } from './routes/webhooks';
import { waRoutes } from './routes/wa';

const server = Fastify({
  logger: {
    transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
  },
});

async function main() {
  await server.register(rawBody, {
    field: 'rawBody',
    global: false, // Important: set to false and apply selectively if needed
    encoding: 'utf8',
    routes: ['/webhooks/*'], // Only apply to webhook routes
  });

  server.register(webhookRoutes, { prefix: '/webhooks' });
  server.register(waRoutes, { prefix: '/api/wa' });

  server.get('/health', async () => {
    return { status: 'ok' };
  });

  try {
    await server.listen({ port: env.PORT, host: '0.0.0.0' });
    server.log.info(`API server listening at http://localhost:${env.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();