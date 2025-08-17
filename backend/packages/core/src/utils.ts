
/// <reference types="node" />

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verifies the HMAC signature of a Shopify webhook request.
 * @param secret The Shopify app's shared secret.
 * @param rawBody The raw request body buffer.
 * @param hmacHeader The value of the 'X-Shopify-Hmac-Sha256' header.
 * @returns True if the HMAC is valid, false otherwise.
 */
export function verifyShopifyHmac(secret: string, rawBody: Buffer, hmacHeader: string): boolean {
  if (!hmacHeader) {
    return false;
  }
  const computedHmac = createHmac('sha256', secret).update(rawBody).digest('base64');
  try {
    const headerBuffer = Buffer.from(hmacHeader, 'base64');
    const computedBuffer = Buffer.from(computedHmac, 'base64');
    // Use timingSafeEqual to prevent timing attacks
    return headerBuffer.length === computedBuffer.length && timingSafeEqual(headerBuffer, computedBuffer);
  } catch (error) {
    // This can happen if the header is not a valid base64 string
    console.error("Error comparing HMACs:", error);
    return false;
  }
}
