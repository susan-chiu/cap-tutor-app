// 啟動整合測試環境：Supabase 相容 API + 真實 Edge Functions（Deno）+ 模擬 Claude／RevenueCat
// 需要：本機 PostgreSQL（DATABASE_URL，已灌好 migration 與 seed）、deno（DENO_BIN）
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const FN_PORTS = { tutor: 54340, 'delete-account': 54341, 'sync-subscription': 54342, 'revenuecat-webhook': 54343 };
process.env.EMU_FUNCTIONS = JSON.stringify(FN_PORTS);

const { server, SERVICE_KEY, PUBLISHABLE_KEY } = await import('./emulator.mjs');
const { startMocks, stopMocks, claudeLog, rcState } = await import('./mock_services.mjs');

export const API = 'http://127.0.0.1:54321';
export const WEBHOOK_AUTH = 'whsec_integration_test_0123456789';
export { SERVICE_KEY, PUBLISHABLE_KEY, claudeLog, rcState };

const DENO = process.env.DENO_BIN ?? '/tmp/node_modules/.bin/deno';
const FN_DIR = fileURLToPath(new URL('../../supabase/functions/', import.meta.url));
const procs = [];

async function waitFor(url, ms = 60000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try { await fetch(url, { method: 'OPTIONS' }); return; } catch { await new Promise((r) => setTimeout(r, 300)); }
  }
  throw new Error('timeout waiting for ' + url);
}

export async function startStack() {
  await new Promise((r) => server.listen(54321, '127.0.0.1', r));
  await startMocks();
  for (const [name, port] of Object.entries(FN_PORTS)) {
    const p = spawn(DENO, ['run', '--allow-net', '--allow-env', '--allow-read', `${FN_DIR}${name}/index.ts`], {
      env: {
        ...process.env,
        DENO_SERVE_ADDRESS: `tcp:127.0.0.1:${port}`,
        SUPABASE_URL: API,
        SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
        ANTHROPIC_API_KEY: 'sk-ant-test',
        ANTHROPIC_BASE_URL: 'http://127.0.0.1:54330',
        REVENUECAT_SECRET_KEY: 'sk_test_revenuecat',
        REVENUECAT_API_URL: 'http://127.0.0.1:54331',
        REVENUECAT_WEBHOOK_AUTH: WEBHOOK_AUTH,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    p.stderr.on('data', (d) => { const s = String(d); if (!/Download|Listening|Warning/.test(s)) process.stderr.write(`[${name}] ${s}`); });
    procs.push(p);
  }
  for (const port of Object.values(FN_PORTS)) await waitFor(`http://127.0.0.1:${port}/`);
}

export async function stopStack() {
  procs.forEach((p) => p.kill());
  stopMocks();
  await new Promise((r) => server.close(r));
}
