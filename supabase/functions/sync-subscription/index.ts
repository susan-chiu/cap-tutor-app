// 購買或恢復購買後，App 呼叫這支函式：伺服器向 RevenueCat 查證後更新完整版到期日
// 部署：supabase functions deploy sync-subscription
// 環境變數：REVENUECAT_SECRET_KEY（RevenueCat 後台的 Secret API key，v1）
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';
import { computeSubscriptionUntil, fetchSubscriber } from '../_shared/subscription.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RC_SECRET = Deno.env.get('REVENUECAT_SECRET_KEY');
const RC_API = Deno.env.get('REVENUECAT_API_URL') ?? 'https://api.revenuecat.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!RC_SECRET) return json({ error: 'purchases_not_configured' }, 503);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data } = jwt ? await admin.auth.getUser(jwt) : { data: null };
  if (!data?.user) return json({ error: 'not_authenticated' }, 401);

  try {
    const sub = await fetchSubscriber(data.user.id, RC_SECRET, RC_API);
    const until = computeSubscriptionUntil(sub);
    const { error } = await admin.rpc('set_subscription', { p_user: data.user.id, p_until: until });
    if (error) throw new Error(error.message);
    return json({ ok: true, subscription_until: until });
  } catch (e) {
    console.error('sync-subscription failed', e);
    return json({ error: 'sync_failed' }, 502);
  }
});
