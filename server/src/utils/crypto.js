import crypto from 'node:crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const PREFIX = 'enc:v1';

/**
 * Derives a 32-byte key from the configured secret.
 * @returns {Buffer}
 */
function getEncryptionKey() {
  return crypto.createHash('sha256').update(env.ENCRYPTION_SECRET).digest();
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Stored format: enc:v1:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>
 * @param {string} plaintext
 * @returns {string}
 */
export function encryptSecret(plaintext) {
  if (typeof plaintext !== 'string') {
    throw new TypeError('Plaintext must be a string');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  const ivHex = iv.toString('hex');

  return `${PREFIX}:${ivHex}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted envelope.
 * @param {string} encryptedPayload
 * @returns {string}
 */
export function decryptSecret(encryptedPayload) {
  if (!encryptedPayload || typeof encryptedPayload !== 'string') {
    throw new TypeError('Encrypted payload must be a string');
  }

  const parts = encryptedPayload.split(':');
  if (parts.length !== 4 || `${parts[0]}:${parts[1]}` !== PREFIX) {
    throw new Error('Invalid encryption payload format');
  }

  const [, , ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
