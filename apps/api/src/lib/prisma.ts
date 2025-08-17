
import { PrismaClient } from '@orderalert-clone/db';

// This is a singleton instance of the Prisma client.
// It's recommended to instantiate it once and reuse it across your application.
export const prisma = new PrismaClient();
