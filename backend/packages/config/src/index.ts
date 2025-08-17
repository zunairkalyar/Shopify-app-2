/// <reference types="node" />

import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from the root of the monorepo
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  SHOPIFY_APP_SECRET: z.string().min(1),
  ALLOWED_SHOP_DOMAINS: z.string().min(1).transform((val) => val.split(',').map(d => d.trim())),
  DEFAULT_TIMEZONE: z.string().default('Asia/Karachi'),
  WA_STORE_DIR: z.string().default('/data/wa-session'),
});

export const env = envSchema.parse(process.env);