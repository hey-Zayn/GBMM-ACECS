import { describe, expect, it } from 'vitest';
import { decryptSecret, encryptSecret } from '../../src/utils/crypto.js';

describe('crypto utilities', () => {
  it('decrypts a value encrypted with AES-GCM', () => {
    const encrypted = encryptSecret('smtp-password');

    expect(decryptSecret(encrypted)).toBe('smtp-password');
  });

  it('rejects a tampered encrypted value', () => {
    const encrypted = encryptSecret('smtp-password');
    const tampered = `${encrypted.slice(0, -2)}00`;

    expect(() => decryptSecret(tampered)).toThrow();
  });

  it('rejects an invalid encrypted payload format', () => {
    expect(() => decryptSecret('invalid')).toThrow('Invalid encryption payload format');
  });

  it('rejects non-string plaintext', () => {
    expect(() => encryptSecret(null)).toThrow('Plaintext must be a string');
  });
});
