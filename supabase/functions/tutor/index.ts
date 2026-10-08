// 錯題小老師 Edge Function
// 部署：supabase functions deploy tutor
// 需要的環境變數（supabase secrets set …）：ANTHROPIC_API_KEY，選填 ANTHROPIC_MODEL
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';
import {
  buildSystemPrompt, detectDistress, firstTurnUserMessage, leaksAnswer, parseTutorReply,
  sanitizeStudentMessage, trimHistory, canResume, historyForDisplay, LEAK_REPLACEMENT, MAX_HINT_LEVEL, MAX_MESSAGES_PER_SESSION,
  SAFETY_REPLY, type ChatMessage, type Persona, type QuestionForTutor,
} from '../_shared/tutor_logic.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-haiku-4-5-20251001';
// 選填：改用其他相容端點（例如公司代理或測試用的模擬伺服器）
const ANTHROPIC_BASE = (Deno.env.get('ANTHROPIC_BASE_URL') ?? 'https://api.anthropic.com').replace(/\/$/, '');

type Action = 'start' | 'reply' | 'hint' | 'reteach';

interface Body {
  action: Action;
  question_id: string;
  session_id?: string;
  student_choice?: string;
  message?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // 1. 驗證登入
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: userData } = jwt ? await admin.auth.getUser(jwt) : { data: null };
  const user = userData?.user;
  if (!user) return json({ error: 'not_authenticated' }, 401);

  let body: Body;
  try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }
  if (!['start', 'reply', 'hint', 'reteach'].includes(body.action) || !body.question_id) {
    return json({ error: 'bad_request' }, 400);
  }

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date());

  const { data: profile } = await admin.from('profiles')
    .select('tutor_persona, premium_until, subscription_until, ai_consent_at').eq('id', user.id).single();
  if (!profile) return json({ error: 'not_authenticated' }, 401);
  // Apple 5.1.2(i)：學生同意把題目與對話提供給 AI 服務後才能使用
  if (!profile.ai_consent_at) return json({ error: 'ai_consent_required' }, 403);
  const premium = (!!profile.premium_until && profile.premium_until >= today) ||
    (!!profile.subscription_until && new Date(profile.subscription_until) > new Date());

  // 2. 每日次數：開新講解看「講解次數」，每一則 AI 回覆都算「回覆則數」
  const { data: cfg } = await admin.from('app_config').select('key, value')
    .in('key', ['free_daily_tutor', 'premium_daily_tutor', 'free_daily_tutor_calls', 'premium_daily_tutor_calls']);
  const cfgNum = (k: string, d: number) => Number(cfg?.find((c) => c.key === k)?.value ?? d);
  const { data: usage } = await admin.from('tutor_usage').select('count, bonus').eq('user_id', user.id).eq('day', today).maybeSingle();
  // 免費版：基本次數 + 今天看廣告換到的次數
  const limit = cfgNum(premium ? 'premium_daily_tutor' : 'free_daily_tutor', premium ? 50 : 3) + (premium ? 0 : usage?.bonus ?? 0);
  const callLimit = cfgNum(premium ? 'premium_daily_tutor_calls' : 'free_daily_tutor_calls', premium ? 400 : 40);
  const used = usage?.count ?? 0;
  // 同一題今天已經講過：接續原本的對話，不再扣次數（不小心點進來又離開，不會白白用掉一次）
  if (body.action === 'start') {
    const { data: prev } = await admin.from('tutor_sessions').select('id, hint_level, messages')
      .eq('user_id', user.id).eq('question_id', body.question_id)
      .gte('created_at', `${today}T00:00:00+08:00`).order('created_at', { ascending: false }).limit(1).maybeSingle();
    const pm = (prev?.messages ?? []) as ChatMessage[];
    if (prev && canResume(pm)) {
      const shown = historyForDisplay(pm);
      return json({
        session_id: prev.id, reply: shown.filter((m) => m.from === 'tutor').at(-1)?.text ?? '',
        hint_level: prev.hint_level, resumed: true, history: shown, remaining_today: Math.max(limit - used, 0),
      });
    }
  }
  if (body.action === 'start' && used >= limit) {
    return json({ error: 'daily_tutor_limit', limit, premium }, 429);
  }

  // 3. 讀題目（含答案與標準解法，只在伺服器端使用）
  const { data: q } = await admin.from('questions')
    .select('unit_id, stem, options, answer, explanation, hints, wrong_reasons, listen_script').eq('id', body.question_id).eq('active', true).single();
  if (!q) return json({ error: 'question_not_found' }, 404);
  const { data: unit } = await admin.from('units').select('subject, semester').eq('id', q.unit_id).maybeSingle();
  const question = { ...q, subject: unit?.subject ?? 'math', semester: unit?.semester ?? null } as QuestionForTutor;

  // 4. 讀或建立對話
  let session: { id: string; hint_level: number; messages: ChatMessage[]; turn: number };
  if (body.action === 'start') {
    const { data, error } = await admin.from('tutor_sessions')
      .insert({ user_id: user.id, question_id: body.question_id }).select('id, hint_level, messages, turn').single();
    if (error || !data) return json({ error: 'session_create_failed' }, 500);
    session = data as typeof session;
  } else {
    const { data } = await admin.from('tutor_sessions')
      .select('id, hint_level, messages, turn, user_id, question_id').eq('id', body.session_id ?? '').single();
    if (!data || data.user_id !== user.id || data.question_id !== body.question_id) {
      return json({ error: 'session_not_found' }, 404);
    }
    session = data as typeof session;
  }
  if (session.messages.length >= MAX_MESSAGES_PER_SESSION) {
    return json({ error: 'session_too_long', session_id: session.id }, 429);
  }

  // 5. 組出這一輪學生說的話
  const studentChoice = body.student_choice && /^[A-D]$/.test(body.student_choice) ? body.student_choice : null;
  let userTurn: string;
  let hintLevel = session.hint_level;
  if (body.action === 'start') {
    userTurn = firstTurnUserMessage(studentChoice);
  } else if (body.action === 'hint') {
    hintLevel = Math.min(hintLevel + 1, MAX_HINT_LEVEL);
    userTurn = hintLevel >= MAX_HINT_LEVEL
      ? '（系統：學生按了「給我完整解法」。請完整說明步驟與答案。）'
      : `（系統：學生按了「給我下一個提示」，請給第 ${hintLevel} 層提示。）`;
  } else if (body.action === 'reteach') {
    userTurn = '（系統：學生說聽不懂，請換一個方式講，例如用生活中的例子或拆成更小的步驟。）';
  } else {
    const text = sanitizeStudentMessage(body.message ?? '');
    if (!text) return json({ error: 'empty_message' }, 400);
    userTurn = text;
    if (detectDistress(text)) {
      const messages = [...session.messages, { role: 'user', content: text }, { role: 'assistant', content: SAFETY_REPLY }];
      await admin.from('tutor_sessions').update({ messages, turn: session.turn + 1, updated_at: new Date().toISOString() }).eq('id', session.id);
      return json({ session_id: session.id, reply: SAFETY_REPLY, safety: true, hint_level: hintLevel });
    }
  }

  if (!ANTHROPIC_KEY) return json({ error: 'tutor_not_configured' }, 503);

  // 原子扣次（同時送很多請求也不會超過上限）；AI 失敗時退回
  const isStart = body.action === 'start';
  const { data: consumed, error: consumeErr } = await admin.rpc('tutor_consume', {
    p_user: user.id, p_is_start: isStart, p_start_limit: limit, p_call_limit: callLimit,
  });
  if (consumeErr) return json({ error: 'tutor_unavailable' }, 502);
  if (consumed === 'daily_tutor_limit') return json({ error: 'daily_tutor_limit', limit, premium }, 429);
  if (consumed === 'daily_call_limit') return json({ error: 'daily_tutor_limit', limit, premium, reason: 'calls' }, 429);
  if (consumed === 'global_limit') return json({ error: 'tutor_busy' }, 503);
  const refund = () => admin.rpc('tutor_refund', { p_user: user.id, p_is_start: isStart });

  // 6. 呼叫 Claude
  const history = trimHistory([...session.messages, { role: 'user', content: userTurn }]);
  const system = buildSystemPrompt({
    q: question, persona: (profile?.tutor_persona ?? 'gentle') as Persona,
    studentChoice, hintLevel, isFirstTurn: body.action === 'start',
  });

  let raw = '';
  try {
    const res = await fetch(`${ANTHROPIC_BASE}/v1/messages`, {
      method: 'POST',
      headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 500, system, messages: history }),
    });
    if (!res.ok) {
      console.error('anthropic error', res.status, await res.text());
      await refund();
      return json({ error: 'tutor_unavailable' }, 502);
    }
    const data = await res.json();
    raw = (data.content ?? []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('');
  } catch (e) {
    console.error('anthropic fetch failed', e);
    await refund();
    return json({ error: 'tutor_unavailable' }, 502);
  }

  const parsed = parseTutorReply(raw);
  let reply = parsed.safety ? SAFETY_REPLY : parsed.reply;
  if (!parsed.safety && leaksAnswer(reply, question, hintLevel)) reply = LEAK_REPLACEMENT;

  // 7. 儲存對話、錯誤原因
  const messages: ChatMessage[] = [...session.messages, { role: 'user', content: userTurn }, { role: 'assistant', content: reply }];
  // 樂觀鎖：同一段對話同時送出兩則時，只有一則會被寫入
  const { data: saved } = await admin.from('tutor_sessions').update({
    messages, hint_level: hintLevel, turn: session.turn + 1, updated_at: new Date().toISOString(),
  }).eq('id', session.id).eq('turn', session.turn).select('id');
  if (!saved?.length) return json({ error: 'busy_retry', session_id: session.id }, 409);
  if (parsed.error_type) {
    await admin.from('mistakes').update({ error_type: parsed.error_type })
      .eq('user_id', user.id).eq('question_id', body.question_id).is('error_type', null);
  }

  return json({
    session_id: session.id,
    reply,
    hint_level: hintLevel,
    error_type: parsed.error_type,
    understood: parsed.understood,
    safety: parsed.safety,
    remaining_today: Math.max(limit - used - (body.action === 'start' ? 1 : 0), 0),
  });
});
