/**
 * Utility for AES-GCM encryption/decryption using Web Crypto API.
 * Compatible with both Browser and Cloudflare Worker runtimes.
 */

const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12;

/**
 * Generates a strong random symmetric key for AES-GCM.
 * @returns Base64 encoded raw key.
 */
export async function generateKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const exported = await crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

/**
 * Generates a session ID.
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Encrypts a string using AES-GCM.
 * @param text The plaintext to encrypt.
 * @param keyBase64 The base64 encoded raw key.
 * @returns Object containing encrypted data and IV as base64 strings.
 */
export async function encryptCredentials(text: string, keyBase64: string): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const key = await importRawKey(keyBase64);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );

  return {
    encrypted: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

/**
 * Decrypts a base64 encoded string using AES-GCM.
 * @param encryptedBase64 The base64 encoded encrypted data.
 * @param ivBase64 The base64 encoded IV.
 * @param keyBase64 The base64 encoded raw key.
 * @returns Decrypted plaintext string.
 */
export async function decryptCredentials(encryptedBase64: string, ivBase64: string, keyBase64: string): Promise<string> {
  const key = await importRawKey(keyBase64);

  const encrypted = base64ToArrayBuffer(encryptedBase64);
  const iv = base64ToArrayBuffer(ivBase64);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: new Uint8Array(iv) },
    key,
    encrypted
  );

  return new TextDecoder().decode(decryptedBuffer);
}

// Aliases for backward compatibility if any
export const generateSessionKey = generateKey;
export const encrypt = encryptCredentials;
export const decrypt = decryptCredentials;

async function importRawKey(keyBase64: string): Promise<CryptoKey> {
  const rawKey = base64ToArrayBuffer(keyBase64);
  return await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: ALGORITHM },
    false,
    ["encrypt", "decrypt"]
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
