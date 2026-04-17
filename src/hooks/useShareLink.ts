import { DigitalAsset } from '../types/asset';

// ────────────────────────────────────────────────────────────
// AES-GCM で資産データを暗号化 → URL-safe Base64 に変換
// 閲覧側は同じパスフレーズを入力して復号
// ────────────────────────────────────────────────────────────

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function toBase64Url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromBase64Url(str: string): Uint8Array {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

/** 資産一覧を暗号化して閲覧用URLフラグメントを生成 */
export async function encryptAssets(assets: DigitalAsset[], passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16)) as Uint8Array<ArrayBuffer>;
  const iv   = crypto.getRandomValues(new Uint8Array(12)) as Uint8Array<ArrayBuffer>;
  const key  = await deriveKey(passphrase, salt);

  const plain = new TextEncoder().encode(JSON.stringify(assets));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);

  // salt(16) + iv(12) + cipher を結合
  const combined = new Uint8Array(16 + 12 + cipher.byteLength);
  combined.set(salt, 0);
  combined.set(iv, 16);
  combined.set(new Uint8Array(cipher), 28);

  return toBase64Url(combined.buffer);
}

/** 復号 */
export async function decryptAssets(token: string, passphrase: string): Promise<DigitalAsset[]> {
  const combined = fromBase64Url(token);
  const salt   = combined.slice(0, 16)  as Uint8Array<ArrayBuffer>;
  const iv     = combined.slice(16, 28) as Uint8Array<ArrayBuffer>;
  const cipher = combined.slice(28);

  const key   = await deriveKey(passphrase, salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return JSON.parse(new TextDecoder().decode(plain)) as DigitalAsset[];
}

/** 閲覧用URLを生成（同一オリジンの #/view?d=TOKEN 形式） */
export function buildViewUrl(token: string): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}#/view?d=${token}`;
}

/** EmailのHTML本文にQR画像を埋め込むためのdata URI生成 */
export async function generateQrDataUrl(text: string): Promise<string> {
  const { default: QRCode } = await import('qrcode');
  return QRCode.toDataURL(text, { width: 256, margin: 2, color: { dark: '#1e293b', light: '#f8fafc' } });
}
