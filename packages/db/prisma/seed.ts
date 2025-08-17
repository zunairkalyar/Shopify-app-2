/// <reference types="node" />

import { exit } from 'process';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultTemplates = [
  {
    key: "order_created_v1",
    locale: "en",
    body: "Thanks, {{first_name}}! Your order #{{order_number}} ({{currency}} {{total}}) is in. We’ll update you here. Reply HELP for support.",
    variables: ["first_name", "order_number", "total", "currency"]
  },
  {
    key: "order_confirm_v1",
    locale: "en",
    body: "Please confirm order #{{order_number}}. Reply 1 to confirm, 2 to cancel.",
    variables: ["order_number"]
  },
  {
    key: "order_dispatched_v1",
    locale: "en",
    body: "Good news! Order #{{order_number}} is on the way. Track: {{tracking_url}}",
    variables: ["order_number","tracking_url"]
  },
  {
    key: "order_cancelled_v1",
    locale: "en",
    body: "We’re sorry—order #{{order_number}} was cancelled. If this seems wrong, reply HELP.",
    variables: ["order_number"]
  },
  {
    key: "abandoned_cart_v1",
    locale: "en",
    body: "Still thinking it over? Your items are waiting: {{cart_link}}. Reply STOP to opt out.",
    variables: ["cart_link"]
  }
];

async function main() {
  console.log('Start seeding...');

  // Seed default templates (global templates have shopId = null)
  for (const t of defaultTemplates) {
    await prisma.template.upsert({
      where: { key_shopId: { key: t.key, shopId: null } },
      update: {},
      create: {
        key: t.key,
        locale: t.locale,
        body: t.body,
        variables: t.variables,
        shopId: null,
      },
    });
  }
  console.log('Default templates seeded.');

  // Seed a test shop
  const shopDomain = (process.env.ALLOWED_SHOP_DOMAINS?.split(',')[0] || 'your-store.myshopify.com').trim();
  
  if (shopDomain) {
    const shop = await prisma.shop.upsert({
      where: { domain: shopDomain },
      update: {},
      create: {
        domain: shopDomain,
        timezone: process.env.DEFAULT_TIMEZONE || 'Asia/Karachi',
      },
    });
    console.log(`Upserted shop: ${shop.domain}`);
  } else {
    console.warn('No ALLOWED_SHOP_DOMAINS found in .env, skipping shop seed.');
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });