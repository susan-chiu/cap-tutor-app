// Supabase 相容 API 模擬伺服器（整合測試用）
// 底層是真正的 PostgreSQL：每個請求都在交易中切換成登入者的角色（anon／authenticated／service_role），
// 並設定 request.jwt.claim.sub，所以資料庫的權限規則（RLS、GRANT）與正式環境一樣生效。
// 支援 App 與 Edge Functions 用到的部分：Auth（註冊、登入、驗證碼重設密碼、刪除使用者）、
// REST（資料表查詢／新增／更新、RPC）、Storage（上傳、簽名網址、列出、刪除）、Functions（轉送到 Deno）。
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const PORT = Number(process.env.EMU_PORT ?? 54321);
export const JWT_SECRET = process.env.EMU_JWT_SECRET ?? 'integration-test-secret-please-change';
export const PUBLISHABLE_KEY = 'sb_publishable_integration_test';
const STORAGE_DIR = process.env.EMU_STORAGE_DIR ?? '/tmp/cap-storage';
const FUNCTIONS = JSON.parse(process.env.EMU_FUNCTIONS ?? '{}'); // { tutor: 54340, ... }
fs.mkdirSync(STORAGE_DIR, { recursive: true });

// ---- 型別轉換：輸出格式比照 PostgREST ----
pg.types.setTypeParser(20, (v) => Number(v));            // int8
pg.types.setTypeParser(1700, (v) => Number(v));          // numeric
pg.types.setTypeParser(1082, (v) => v);                  // date → 'YYYY-MM-DD'
pg.types.setTypeParser(1114, (v) => new Date(v + 'Z').toISOString());
pg.types.setTypeParser(1184, (v) => new Date(v).toISOString());

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:55432/capapp', max: 10 });

// ---- JWT ----
const b64u = (b) => Buffer.from(b).toString('base64url');
export function signJwt(payload, ttl = 3600) {
  const now = Math.floor(Date.now() / 1000);
  const body = { iat: now, exp: now + ttl, ...payload };
  const head = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const data = `${head}.${b64u(JSON.stringify(body))}`;
  return `${data}.${crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url')}`;
}
function verifyJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${parts[0]}.${parts[1]}`).digest('base64url');
  if (sig !== parts[2]) return null;
  const body = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  if (body.exp && body.exp < Date.now() / 1000) return null;
  return body;
}
export const SERVICE_KEY = signJwt({ role: 'service_role' }, 3600 * 24 * 365);

function whoIs(req) {
  const bearer = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
  const token = bearer || req.headers.apikey || '';
  if (token === PUBLISHABLE_KEY) return { role: 'anon', sub: null };
  const claims = token ? verifyJwt(token) : null;
  if (!claims) return { role: 'anon', sub: null, invalid: !!token && token !== PUBLISHABLE_KEY };
  return { role: claims.role === 'service_role' ? 'service_role' : claims.role === 'authenticated' ? 'authenticated' : 'anon', sub: claims.sub ?? null };
}

async function asRole(who, fn) {
  const c = await pool.connect();
  try {
    await c.query('begin');
    await c.query(`select set_config('request.jwt.claim.sub', $1, true)`, [who.sub ?? '']);
    await c.query(`set local role ${who.role}`);
    const r = await fn(c);
    await c.query('commit');
    return r;
  } catch (e) {
    await c.query('rollback').catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

// ---- HTTP 工具 ----
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info, prefer, accept, accept-profile, content-profile, x-upsert, range',
  'access-control-allow-methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'access-control-expose-headers': 'content-range',
};
function send(res, status, body, headers = {}) {
  const isBuf = Buffer.isBuffer(body);
  res.writeHead(status, { ...CORS, ...(body === undefined || isBuf ? {} : { 'content-type': 'application/json; charset=utf-8' }), ...headers });
  res.end(body === undefined ? undefined : isBuf ? body : JSON.stringify(body));
}
function pgError(res, e, who) {
  const map = { '42501': who?.role === 'anon' ? 401 : 403, '23505': 409, 'PGRST116': 406, '42883': 404 };
  send(res, map[e.code] ?? 400, { code: e.code ?? '', message: e.message, details: e.detail ?? null, hint: e.hint ?? null });
}
async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}
const qi = (s) => {
  if (!/^[a-z_][a-z0-9_]*$/i.test(s)) throw Object.assign(new Error('bad identifier ' + s), { code: '42601' });
  return `"${s}"`;
};

// ---- Auth ----
const otps = new Map(); // email → { code, userId }
function hashPw(pw) {
  const salt = crypto.randomBytes(16);
  return `${salt.toString('hex')}:${crypto.scryptSync(pw, salt, 32).toString('hex')}`;
}
function checkPw(pw, stored) {
  if (!stored) return false;
  const [salt, h] = stored.split(':');
  return crypto.timingSafeEqual(crypto.scryptSync(pw, Buffer.from(salt, 'hex'), 32), Buffer.from(h, 'hex'));
}
function userJson(u) {
  return { id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email, email_confirmed_at: u.email_confirmed_at,
    user_metadata: u.raw_user_meta_data ?? {}, app_metadata: { provider: 'email' }, created_at: u.created_at };
}
function sessionFor(u) {
  const access = signJwt({ sub: u.id, role: 'authenticated', aud: 'authenticated', email: u.email });
  const refresh = signJwt({ sub: u.id, typ: 'refresh' }, 3600 * 24 * 30);
  return { access_token: access, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: refresh, user: userJson(u) };
}
const authErr = (res, status, code, msg) => send(res, status, { code: status, error_code: code, msg, error: code, error_description: msg });

async function handleAuth(req, res, url, body) {
  const p = url.pathname.replace('/auth/v1', '');
  const q = (sql, params) => pool.query(sql, params);
  if (p === '/signup' && req.method === 'POST') {
    const { email, password, data } = JSON.parse(body || '{}');
    if (!email || !password || password.length < 6) return authErr(res, 422, 'weak_password', 'Password should be at least 6 characters');
    const exists = await q(`select 1 from auth.users where lower(email) = lower($1)`, [email]);
    if (exists.rowCount) return authErr(res, 422, 'user_already_exists', 'User already registered');
    const r = await q(`insert into auth.users (email, encrypted_password, raw_user_meta_data, email_confirmed_at)
                       values ($1, $2, $3, now()) returning *`, [email, hashPw(password), data ?? {}]);
    return send(res, 200, sessionFor(r.rows[0]));
  }
  if (p === '/token' && req.method === 'POST') {
    const grant = url.searchParams.get('grant_type');
    const b = JSON.parse(body || '{}');
    if (grant === 'password') {
      const r = await q(`select * from auth.users where lower(email) = lower($1)`, [b.email]);
      if (!r.rowCount || !checkPw(b.password, r.rows[0].encrypted_password)) return authErr(res, 400, 'invalid_credentials', 'Invalid login credentials');
      return send(res, 200, sessionFor(r.rows[0]));
    }
    if (grant === 'refresh_token') {
      const c = verifyJwt(b.refresh_token ?? '');
      if (!c || c.typ !== 'refresh') return authErr(res, 400, 'invalid_grant', 'Invalid Refresh Token');
      const r = await q(`select * from auth.users where id = $1`, [c.sub]);
      if (!r.rowCount) return authErr(res, 400, 'invalid_grant', 'User not found');
      return send(res, 200, sessionFor(r.rows[0]));
    }
  }
  if (p === '/user') {
    const who = whoIs(req);
    if (who.role !== 'authenticated') return authErr(res, 401, 'bad_jwt', 'invalid JWT');
    const r = await q(`select * from auth.users where id = $1`, [who.sub]);
    if (!r.rowCount) return authErr(res, 404, 'user_not_found', 'User not found');
    if (req.method === 'PUT') {
      const b = JSON.parse(body || '{}');
      if (b.password) await q(`update auth.users set encrypted_password = $2 where id = $1`, [who.sub, hashPw(b.password)]);
    }
    return send(res, 200, userJson(r.rows[0]));
  }
  if (p === '/logout') return send(res, 204);
  if (p === '/recover' && req.method === 'POST') {
    const { email } = JSON.parse(body || '{}');
    const r = await q(`select id from auth.users where lower(email) = lower($1)`, [email]);
    if (r.rowCount) otps.set(email.toLowerCase(), { code: String(crypto.randomInt(100000, 999999)), userId: r.rows[0].id });
    return send(res, 200, {});
  }
  if (p === '/verify' && req.method === 'POST') {
    const b = JSON.parse(body || '{}');
    const rec = otps.get((b.email ?? '').toLowerCase());
    if (!rec || rec.code !== b.token || b.type !== 'recovery') return authErr(res, 403, 'otp_expired', 'Token has expired or is invalid');
    otps.delete(b.email.toLowerCase());
    const r = await q(`select * from auth.users where id = $1`, [rec.userId]);
    return send(res, 200, sessionFor(r.rows[0]));
  }
  const m = p.match(/^\/admin\/users\/([0-9a-f-]+)$/);
  if (m && req.method === 'DELETE') {
    if (whoIs(req).role !== 'service_role') return authErr(res, 403, 'not_admin', 'User not allowed');
    await q(`delete from auth.users where id = $1`, [m[1]]);
    return send(res, 200, {});
  }
  return authErr(res, 404, 'not_found', 'not implemented in emulator: ' + req.method + ' ' + p);
}

// ---- REST ----
function parseFilters(params) {
  const where = [];
  const vals = [];
  for (const [k, v] of params) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(k)) continue;
    const m = v.match(/^(eq|neq|gt|gte|lt|lte|is|in)\.(.*)$/s);
    if (!m) throw Object.assign(new Error('unsupported filter ' + k + '=' + v), { code: 'PGRST100' });
    const [, op, raw] = m;
    if (op === 'is') { where.push(`${qi(k)} is ${raw === 'null' ? 'null' : raw === 'true' ? 'true' : 'false'}`); continue; }
    if (op === 'in') {
      const items = [...raw.replace(/^\(|\)$/g, '').matchAll(/"((?:[^"\\]|\\.)*)"|([^,]+)/g)].map((x) => x[1] ?? x[2]);
      vals.push(items); where.push(`${qi(k)}::text = any($${vals.length}::text[])`); continue;
    }
    const sqlOp = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=' }[op];
    vals.push(raw); where.push(`${qi(k)} ${sqlOp} $${vals.length}`);
  }
  return { where, vals };
}
function selectList(params) {
  const s = params.get('select');
  if (!s || s === '*') return '*';
  return s.split(',').map((c) => qi(c.trim())).join(', ');
}
function orderLimit(params) {
  let sql = '';
  const o = params.get('order');
  if (o) sql += ' order by ' + o.split(',').map((x) => { const [c, dir] = x.split('.'); return `${qi(c)} ${dir === 'desc' ? 'desc' : 'asc'}`; }).join(', ');
  if (params.get('limit')) sql += ` limit ${Number(params.get('limit'))}`;
  if (params.get('offset')) sql += ` offset ${Number(params.get('offset'))}`;
  return sql;
}
function wantsObject(req) { return (req.headers.accept ?? '').includes('application/vnd.pgrst.object+json'); }
function respondRows(req, res, rows, status = 200) {
  if (wantsObject(req)) {
    if (rows.length !== 1) return send(res, 406, { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: `The result contains ${rows.length} rows`, hint: null });
    return send(res, status, rows[0]);
  }
  return send(res, status, rows);
}

const fnMeta = new Map();
async function functionInfo(name) {
  if (fnMeta.has(name)) return fnMeta.get(name);
  const r = await pool.query(`select p.proretset, t.typname from pg_proc p join pg_type t on t.oid = p.prorettype
                              join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = $1 limit 1`, [name]);
  const info = r.rowCount ? { set: r.rows[0].proretset, void: r.rows[0].typname === 'void' } : null;
  fnMeta.set(name, info);
  return info;
}

async function handleRest(req, res, url, body) {
  const who = whoIs(req);
  if (who.invalid) return send(res, 401, { code: 'PGRST301', message: 'JWT invalid' });
  const p = url.pathname.replace('/rest/v1/', '');
  const params = url.searchParams;
  try {
    if (p.startsWith('rpc/')) {
      const name = p.slice(4);
      const info = await functionInfo(name);
      if (!info) return send(res, 404, { code: 'PGRST202', message: `Could not find the function public.${name}` });
      const args = req.method === 'GET' ? Object.fromEntries(params) : JSON.parse(body.length ? body : '{}');
      const keys = Object.keys(args);
      const call = `public.${qi(name)}(${keys.map((k, i) => `${qi(k)} => $${i + 1}`).join(', ')})`;
      const vals = keys.map((k) => args[k]);
      const out = await asRole(who, async (c) => {
        if (info.set) return (await c.query(`select * from ${call}`, vals)).rows;
        const r = await c.query(`select ${call} as v`, vals);
        return r.rows[0].v;
      });
      if (info.void) return send(res, 204);
      if (info.set) return respondRows(req, res, out);
      return send(res, 200, out);
    }
    const table = qi(p);
    if (req.method === 'GET' || req.method === 'HEAD') {
      const { where, vals } = parseFilters(params);
      const sql = `select ${selectList(params)} from public.${table}${where.length ? ' where ' + where.join(' and ') : ''}${orderLimit(params)}`;
      const rows = await asRole(who, async (c) => (await c.query(sql, vals)).rows);
      return respondRows(req, res, rows);
    }
    const prefer = req.headers.prefer ?? '';
    const returning = prefer.includes('return=representation') ? ` returning ${selectList(params)}` : '';
    if (req.method === 'PATCH') {
      const patch = JSON.parse(body);
      const cols = Object.keys(patch);
      const { where, vals } = parseFilters(params);
      const setVals = cols.map((k) => (patch[k] !== null && typeof patch[k] === 'object' ? JSON.stringify(patch[k]) : patch[k]));
      const sql = `update public.${table} set ${cols.map((k, i) => `${qi(k)} = $${vals.length + i + 1}`).join(', ')}` +
        `${where.length ? ' where ' + where.join(' and ') : ''}${returning}`;
      const rows = await asRole(who, async (c) => (await c.query(sql, [...vals, ...setVals])).rows);
      return returning ? respondRows(req, res, rows) : send(res, 204);
    }
    if (req.method === 'POST') {
      const items = [].concat(JSON.parse(body));
      const cols = [...new Set(items.flatMap((o) => Object.keys(o)))];
      const vals = [];
      const tuples = items.map((o) => `(${cols.map((k) => {
        const v = o[k];
        vals.push(v !== null && typeof v === 'object' ? JSON.stringify(v) : v ?? null);
        return `$${vals.length}`;
      }).join(', ')})`);
      let conflict = '';
      if (prefer.includes('resolution=merge-duplicates') || prefer.includes('resolution=ignore-duplicates')) {
        let target = params.get('on_conflict');
        if (!target) {
          const pk = await pool.query(`select a.attname from pg_index i join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
                                       where i.indrelid = ('public.' || $1)::regclass and i.indisprimary`, [p]);
          target = pk.rows.map((r) => r.attname).join(',');
        }
        const tcols = target.split(',').map((c) => qi(c.trim()));
        conflict = prefer.includes('ignore-duplicates') ? ` on conflict (${tcols}) do nothing`
          : ` on conflict (${tcols}) do update set ${cols.map((c) => `${qi(c)} = excluded.${qi(c)}`).join(', ')}`;
      }
      const sql = `insert into public.${table} (${cols.map(qi).join(', ')}) values ${tuples.join(', ')}${conflict}${returning}`;
      const rows = await asRole(who, async (c) => (await c.query(sql, vals)).rows);
      return returning ? respondRows(req, res, rows, 201) : send(res, 201);
    }
    return send(res, 405, { message: 'method not supported' });
  } catch (e) {
    return pgError(res, e, who);
  }
}

// ---- Storage ----
async function handleStorage(req, res, url, body) {
  const who = whoIs(req);
  const p = decodeURIComponent(url.pathname.replace('/storage/v1', ''));
  try {
    let m;
    if ((m = p.match(/^\/object\/sign\/([^/]+)\/(.+)$/)) && req.method === 'POST') {
      const [, bucket, name] = m;
      const rows = await asRole(who, async (c) => (await c.query(`select name from storage.objects where bucket_id = $1 and name = $2`, [bucket, name])).rows);
      if (!rows.length) return send(res, 400, { statusCode: '404', error: 'not_found', message: 'Object not found' });
      const token = signJwt({ url: `${bucket}/${name}` }, JSON.parse(body || '{}').expiresIn ?? 60);
      return send(res, 200, { signedURL: `/object/sign/${bucket}/${encodeURI(name)}?token=${token}` });
    }
    if ((m = p.match(/^\/object\/sign\/([^/]+)\/(.+)$/)) && req.method === 'GET') {
      const claims = verifyJwt(url.searchParams.get('token') ?? '');
      if (!claims || claims.url !== `${m[1]}/${m[2]}`) return send(res, 400, { message: 'invalid signature' });
      const file = path.join(STORAGE_DIR, m[1], m[2]);
      return fs.existsSync(file) ? send(res, 200, fs.readFileSync(file), { 'content-type': 'image/jpeg' }) : send(res, 404, { message: 'not found' });
    }
    if ((m = p.match(/^\/object\/list\/([^/]+)$/)) && req.method === 'POST') {
      const { prefix = '' } = JSON.parse(body || '{}');
      const rows = await asRole(who, async (c) => (await c.query(`select id, name from storage.objects where bucket_id = $1 and name like $2 || '/%'`, [m[1], prefix])).rows);
      return send(res, 200, rows.map((r) => ({ id: r.id, name: r.name.slice(prefix.length + 1) })));
    }
    if ((m = p.match(/^\/object\/([^/]+)$/)) && req.method === 'DELETE') {
      const { prefixes = [] } = JSON.parse(body || '{}');
      const rows = await asRole(who, async (c) => (await c.query(`delete from storage.objects where bucket_id = $1 and name = any($2) returning name`, [m[1], prefixes])).rows);
      for (const r of rows) fs.rmSync(path.join(STORAGE_DIR, m[1], r.name), { force: true });
      return send(res, 200, rows.map((r) => ({ name: r.name })));
    }
    if ((m = p.match(/^\/object\/([^/]+)\/(.+)$/)) && (req.method === 'POST' || req.method === 'PUT')) {
      const [, bucket, name] = m;
      await asRole(who, async (c) => c.query(`insert into storage.objects (bucket_id, name) values ($1, $2)`, [bucket, name]));
      const file = path.join(STORAGE_DIR, bucket, name);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, body);
      return send(res, 200, { Key: `${bucket}/${name}`, Id: crypto.randomUUID() });
    }
    return send(res, 404, { message: 'not implemented in emulator: ' + req.method + ' ' + p });
  } catch (e) {
    const status = e.code === '42501' ? 403 : 400;
    return send(res, status, { statusCode: String(status), error: 'Unauthorized', message: e.message });
  }
}

// ---- Functions：轉送到各自的 Deno 行程 ----
async function handleFunction(req, res, url, body) {
  const name = url.pathname.split('/')[3];
  const port = FUNCTIONS[name];
  if (!port) return send(res, 404, { error: 'function not found: ' + name });
  const r = await fetch(`http://127.0.0.1:${port}/${name}`, {
    method: req.method,
    headers: Object.fromEntries(Object.entries(req.headers).filter(([k]) => !['host', 'content-length', 'connection'].includes(k))),
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
  });
  const buf = Buffer.from(await r.arrayBuffer());
  res.writeHead(r.status, { ...CORS, 'content-type': r.headers.get('content-type') ?? 'application/json' });
  res.end(buf);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      return send(res, 200, undefined, { 'access-control-allow-headers': req.headers['access-control-request-headers'] ?? CORS['access-control-allow-headers'] });
    }
    const url = new URL(req.url, `http://${req.headers.host}`);
    const body = await readBody(req);
    if (url.pathname.startsWith('/auth/v1/')) return await handleAuth(req, res, url, body.toString());
    if (url.pathname.startsWith('/rest/v1/')) return await handleRest(req, res, url, body);
    if (url.pathname.startsWith('/storage/v1/')) return await handleStorage(req, res, url, body);
    if (url.pathname.startsWith('/functions/v1/')) return await handleFunction(req, res, url, body);
    if (url.pathname === '/__test/otp') return send(res, 200, otps.get((url.searchParams.get('email') ?? '').toLowerCase()) ?? null);
    return send(res, 404, { message: 'not found' });
  } catch (e) {
    console.error('emulator error', e);
    send(res, 500, { message: String(e?.message ?? e) });
  }
});

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(PORT, '127.0.0.1', () => console.log(`emulator listening on http://127.0.0.1:${PORT}`));
}
export { server };
