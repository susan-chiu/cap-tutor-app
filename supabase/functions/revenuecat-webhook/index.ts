// RevenueCat Webhook：續訂、取消後到期、退款等事件發生時，重新查證並更新完整版到期日
// 部署：supabase functions deploy revenuecat-webhook --no-verify-jwt
// 環境變數：REVENUECAT_SECRET_KEY、REVENUECAT_WEBHOOK_AUTH（自訂一組長密碼，同時填到 RevenueCat 後台 Webhook 的 Authorization header）
import { createClient } from 'npm:@supabase/supabase-js@2';
import { json } from '../_shared/cors.ts';
import { computeSubscriptionUntil, fetchSubscriber, safeEqual, userIdsFromEvent } from '../_shared/subscription.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RC_SECRET = Deno.env.get('REVENUECAT_SECRET_KEY');
const RC_API = Deno.env.get('REVENUECAT_API_URL') ?? 'https://api.revenuecat.com';
const WEBHOOK_AUTH = Deno.env.get('REVENUECAT_WEBHOOK_AUTH');

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!RC_SECRET || !WEBHOOK_AUTH) return json({ error: 'not_configured' }, 503);

  const auth = req.headers.get('Authorization') ?? '';
  const expected = WEBHOOK_AUTH.startsWith('Bearer ') ? WEBHOOK_AUTH : `Bearer ${WEBHOOK_AUTH}`;
  if (!safeEqual(auth, expected) && !safeEqual(auth, WEBHOOK_AUTH)) return json({ error: 'unauthorized' }, 401);

  let body: { event?: Record<string, unknown> };
  try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }
  const event = body.event ?? {};
  if (event.type === 'TEST') return json({ ok: true, test: true });

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const ids = userIdsFromEvent(event);
  const results: Record<string, string | null> = {};
  for (const id of ids) {
    const { data: exists } = await admin.from('profiles').select('id').eq('id', id).maybeSingle();
    if (!exists) continue;
    try {
      const until = computeSubscriptionUntil(await fetchSubscriber(id, RC_SECRET, RC_API));
      const { error: rpcErr } = await admin.rpc('set_subscription', { p_user: id, p_until: until });
      if (rpcErr) throw rpcErr;
      results[id] = until;
    } catch (e) {
      console.error('webhook sync failed', id, e);
      // 回 500 讓 RevenueCat 稍後重送
      return json({ error: 'sync_failed' }, 500);
    }
  }
  return json({ ok: true, updated: results });
});
