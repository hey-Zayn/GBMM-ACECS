import crypto from 'node:crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const PREFIX = 'enc:v1';

function getEncryptionKey() {
  return crypto.createHash('sha256').update(env.ENCRYPTION_SECRET).digest();
}

export function encryptSecret(plaintext) {
  if (typeof plaintext !== 'string') {
    throw new TypeError('Plaintext must be a string');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [PREFIX, iv.toString('hex'), authTag.toString('hex'), ciphertext.toString('hex')].join(':');
}

export function decryptSecret(encryptedPayload) {
  if (typeof encryptedPayload !== 'string' || !encryptedPayload) {
    throw new TypeError('Encrypted payload must be a string');
  }

  const [prefix, version, ivHex, authTagHex, ciphertextHex] = encryptedPayload.split(':');
  if (`${prefix}:${version}` !== PREFIX) {
    throw new Error('Invalid encryption payload format');
  }

  const iv = parseHex(ivHex, IV_LENGTH, 'iv');
  const authTag = parseHex(authTagHex, AUTH_TAG_LENGTH, 'authentication tag');
  const ciphertext = parseHex(ciphertextHex, null, 'ciphertext');
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

function parseHex(value, expectedLength, name) {
  if (!value || !/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) {
    throw new Error(`Invalid ${name}`);
  }

  const buffer = Buffer.from(value, 'hex');
  if (expectedLength !== null && buffer.length !== expectedLength) {
    throw new Error(`Invalid ${name}`);
  }

  return buffer;
}
