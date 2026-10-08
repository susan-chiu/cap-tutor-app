// 模擬外部服務（整合測試用）：Claude API 與 RevenueCat API
// Claude：依對話內容回傳固定的 JSON 回覆；學生說「告訴我答案」時，故意回一段洩漏答案的話，用來測試伺服器的防洩漏機制。
// RevenueCat：GET /v1/subscribers/:id 依測試設定回傳訂閱權益。
import http from 'node:http';

const CLAUDE_PORT = Number(process.env.CLAUDE_PORT ?? 54330);
const RC_PORT = Number(process.env.RC_PORT ?? 54331);
export const claudeLog = [];
export const rcState = new Map(); // userId → entitlement 或 null

const read = async (req) => { const c = []; for await (const x of req) c.push(x); return Buffer.concat(c).toString(); };

const claude = http.createServer(async (req, res) => {
  const body = JSON.parse(await read(req) || '{}');
  claudeLog.push({ key: req.headers['x-api-key'], model: body.model, system: body.system, messages: body.messages });
  const last = body.messages?.at(-1)?.content ?? '';
  let reply;
  if (last.includes('告訴我答案')) reply = '好啦，答案是 C，直接選 C 就對了。';
  else if (last.includes('系統：學生剛答錯')) reply = '嗨！差一點點～你當時是怎麼想的呢？';
  else if (last.includes('給我下一個提示')) reply = '提示：先想想這題要用哪一個公式，再把數字代進去看看？';
  else if (last.includes('完整解法')) reply = '完整解法：照標準解法一步一步算，最後得到正確答案。你用自己的話說一次關鍵步驟？';
  else if (last.includes('換一個方式講')) reply = '換個方式想：把它想成分蛋糕，每一份要一樣大。';
  else reply = '原來如此！先看看題目要求什麼，再想第一步要做什麼？';
  const json = JSON.stringify({ reply, error_type: last.includes('卡住') ? 'calculation' : null, understood: false, safety: false });
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ id: 'msg_test', type: 'message', role: 'assistant', model: body.model,
    content: [{ type: 'text', text: json }], stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 10 } }));
});

const rc = http.createServer(async (req, res) => {
  const m = req.url.match(/^\/v1\/subscribers\/([^/?]+)/);
  if (!m || req.headers.authorization !== 'Bearer sk_test_revenuecat') { res.writeHead(401); res.end('{}'); return; }
  const ent = rcState.get(decodeURIComponent(m[1]));
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ subscriber: { entitlements: ent ? { premium: ent } : {} } }));
});

export function startMocks() {
  return Promise.all([
    new Promise((r) => claude.listen(CLAUDE_PORT, '127.0.0.1', r)),
    new Promise((r) => rc.listen(RC_PORT, '127.0.0.1', r)),
  ]);
}
export function stopMocks() { claude.close(); rc.close(); }
