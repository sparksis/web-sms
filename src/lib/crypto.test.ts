import { describe, it, expect } from 'vitest';
import { generateKey, encryptCredentials, decryptCredentials } from './crypto';

describe('Crypto Utility', () => {
  it('should encrypt and decrypt a string correctly', async () => {
    const originalText = 'my-secret-api-password';
    const key = await generateKey();

    const { encrypted, iv } = await encryptCredentials(originalText, key);
    expect(encrypted).toBeDefined();
    expect(iv).toBeDefined();
    expect(encrypted).not.toBe(originalText);

    const decrypted = await decryptCredentials(encrypted, iv, key);
    expect(decrypted).toBe(originalText);
  });

  it('should fail to decrypt with the wrong key', async () => {
    const originalText = 'my-secret-api-password';
    const key1 = await generateKey();
    const key2 = await generateKey();

    const { encrypted, iv } = await encryptCredentials(originalText, key1);

    await expect(decryptCredentials(encrypted, iv, key2)).rejects.toThrow();
  });

  it('should fail to decrypt with corrupted data', async () => {
    const originalText = 'my-secret-api-password';
    const key = await generateKey();

    const { encrypted, iv } = await encryptCredentials(originalText, key);
    const corruptedEncrypted = encrypted.substring(0, encrypted.length - 4) + 'AAAA';

    await expect(decryptCredentials(corruptedEncrypted, iv, key)).rejects.toThrow();
  });

  it('should generate unique keys', async () => {
    const key1 = await generateKey();
    const key2 = await generateKey();
    expect(key1).not.toBe(key2);
  });
});
