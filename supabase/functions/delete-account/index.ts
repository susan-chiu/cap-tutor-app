// 刪除帳號（App Store 規定 App 內必須能刪除帳號）
// 部署：supabase functions deploy delete-account
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data } = jwt ? await admin.auth.getUser(jwt) : { data: null };
  if (!data?.user) return json({ error: 'not_authenticated' }, 401);
  // 先刪成績證明檔案，再刪帳號（資料表設定 on delete cascade，其餘資料會一起刪除）
  // 分批刪除（每次最多 100 個），失敗就停止、不刪帳號，避免留下未成年學生的照片
  for (let round = 0; round < 50; round++) {
    const { data: files, error: listErr } = await admin.storage.from('proofs').list(data.user.id, { limit: 100 });
    if (listErr) return json({ error: 'delete_failed' }, 500);
    if (!files?.length) break;
    const { error: rmErr } = await admin.storage.from('proofs').remove(files.map((f) => `${data.user.id}/${f.name}`));
    if (rmErr) return json({ error: 'delete_failed' }, 500);
  }
  const { error } = await admin.auth.admin.deleteUser(data.user.id);
  if (error) return json({ error: 'delete_failed' }, 500);
  return json({ ok: true });
});
