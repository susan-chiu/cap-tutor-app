// AdMob 獎勵式廣告「伺服器端驗證」（SSV）回呼
// AdMob 在學生看完廣告後會 GET 這個網址，帶上簽章；驗證通過才記一筆 ad_views，
// 之後 grant_ad_reward 會要求先有這筆紀錄才發獎勵（app_config.ad_ssv_required = true 時）。
//
// 部署：supabase functions deploy admob-ssv --no-verify-jwt
// AdMob 後台：每個獎勵廣告單元 → 伺服器端驗證 → 回呼網址填
//   https://<專案代碼>.supabase.co/functions/v1/admob-ssv
// 文件：https://developers.google.com/admob/android/ssv
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const KEYS_URL = 'https://www.gstatic.com/admob/reward/verifier-keys.json';
const PLACEMENTS = new Set(['energy', 'xp2x', 'tutor']);

type VerifierKey = { keyId: number; pem: string; base64: string };
let keysCache: { at: number; keys: VerifierKey[] } | null = null;

async function verifierKeys(): Promise<VerifierKey[]> {
  if (keysCache && Date.now() - keysCache.at < 24 * 3600 * 1000) return keysCache.keys;
  const r = await fetch(KEYS_URL);
  if (!r.ok) throw new Error('keys_fetch_failed');
  const j = await r.json() as { keys: VerifierKey[] };
  keysCache = { at: Date.now(), keys: j.keys };
  return j.keys;
}

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

// Google 的簽章是 DER 編碼的 ECDSA；WebCrypto 要的是 r、s 各 32 bytes 接起來
function derToRaw(der: Uint8Array): Uint8Array {
  let i = 2; // 0x30 len
  if (der[i++] !== 0x02) throw new Error('bad_der');
  let rl = der[i++]; let r = der.slice(i, i + rl); i += rl;
  if (der[i++] !== 0x02) throw new Error('bad_der');
  let sl = der[i++]; let s = der.slice(i, i + sl);
  const fix = (x: Uint8Array) => { while (x.length > 32 && x[0] === 0) x = x.slice(1); const out = new Uint8Array(32); out.set(x, 32 - x.length); return out; };
  const raw = new Uint8Array(64); raw.set(fix(r), 0); raw.set(fix(s), 32); return raw;
}

async function verify(url: URL): Promise<boolean> {
  const sig = url.searchParams.get('signature'); const keyId = url.searchParams.get('key_id');
  if (!sig || !keyId) return false;
  // 被簽的內容：網址問號之後、「&signature=」之前的原始字串
  const q = url.search.slice(1); const cut = q.indexOf('&signature=');
  if (cut < 0) return false;
  const message = new TextEncoder().encode(q.slice(0, cut));
  const key = (await verifierKeys()).find((k) => String(k.keyId) === keyId);
  if (!key) return false;
  const der = Uint8Array.from(atob(key.base64), (c) => c.charCodeAt(0));
  const pub = await crypto.subtle.importKey('spki', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pub, derToRaw(b64urlToBytes(sig)), message);
}

Deno.serve(async (req) => {
  if (req.method !== 'GET') return new Response('method_not_allowed', { status: 405 });
  const url = new URL(req.url);
  let ok = false;
  try { ok = await verify(url); } catch (e) { console.warn('ssv verify error', e); }
  if (!ok) return new Response('bad_signature', { status: 400 });

  const userId = url.searchParams.get('user_id');
  const placement = url.searchParams.get('custom_data') ?? '';
  const tx = url.searchParams.get('transaction_id');
  if (!userId || !tx || !PLACEMENTS.has(placement)) return new Response('bad_request', { status: 400 });

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { error } = await admin.from('ad_views').insert({
    transaction_id: tx, user_id: userId, placement, ad_unit: url.searchParams.get('ad_unit'),
    ad_network: url.searchParams.get('ad_network'),
  });
  // 同一筆通知 AdMob 可能重送：已存在就當成功
  if (error && !String(error.message).includes('duplicate')) { console.warn('ad_views insert', error); return new Response('db_error', { status: 500 }); }
  return new Response('ok');
});
