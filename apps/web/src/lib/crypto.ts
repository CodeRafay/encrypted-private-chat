// End-to-end encryption for room messages. The key lives only in the URL #fragment,
// which browsers never send to any server.

export interface Encrypted {
  iv: string;
  ct: string;
}

const toB64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));
const fromB64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export function newKey(): string {
  return toB64(crypto.getRandomValues(new Uint8Array(32)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Rejects if the key is malformed. */
export async function importKey(key: string): Promise<CryptoKey> {
  const raw = fromB64(key.replace(/-/g, '+').replace(/_/g, '/'));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function encrypt(key: CryptoKey, value: unknown): Promise<Encrypted> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify(value));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);
  return { iv: toB64(iv), ct: toB64(new Uint8Array(ct)) };
}

/** Returns null for anything that wasn't encrypted with this key. */
export async function decrypt(key: CryptoKey, { iv, ct }: Encrypted): Promise<unknown> {
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(iv) }, key, fromB64(ct));
    return JSON.parse(new TextDecoder().decode(plain)) as unknown;
  } catch {
    return null;
  }
}
