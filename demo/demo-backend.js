/* 會考小老師・網頁試用版的「瀏覽器內後端」
 * 攔截 App 對 https://demo.supabase.co 的請求，在瀏覽器裡模擬 Supabase（登入、資料庫函式、小老師）。
 * 資料只存在這個瀏覽器（localStorage），小老師是用題目內建的分層提示與解析做的示範回覆，不是真的 AI。
 * 規則盡量和正式後端（supabase/migrations）一致：每日 5 題連勝、保護卡、錯題 1/3/7 天複習、免費額度、版本章節。
 */
(function () {
  'use strict';
  // 試用版可能被放在子路徑（例如 https://xxx/_f/版本號）：
  // 1. 記下檔案實際所在的資料夾（__CAP_BASE），圖示、圖片、主程式都從這裡載入
  // 2. App 的頁面網址都放在這個資料夾底下（例如 /_f/me），每個頁面都有一份同樣的 HTML，
  //    所以在任何頁面按重新整理都能正常打開
  // 3. 一開始的網址如果不是 App 的頁面（例如 /_f/版本號），先換成首頁
  var ROUTES = ['learn', 'mistakes', 'me', 'quiz', 'tutor', 'top-three', 'paywall', 'help', 'mock-exam', 'onboarding', 'login', 'forgot'];
  try {
    var cur = document.currentScript;
    var me = cur && cur.src;
    window.__CAP_BASE = me ? me.replace(/demo-backend\.js(\?.*)?$/, '') : location.origin + '/';
    window.__CAP_ENTRY = cur && cur.getAttribute('data-entry');
    window.__CAP_PATH = new URL(window.__CAP_BASE).pathname.replace(/\/$/, '');
    var rest = location.pathname.indexOf(window.__CAP_PATH + '/') === 0 ? location.pathname.slice(window.__CAP_PATH.length + 1) : null;
    var first = rest === null ? null : rest.split('/')[0];
    if (!(rest === '' || ROUTES.indexOf(first) >= 0)) history.replaceState(null, '', window.__CAP_PATH + '/' + location.search + location.hash);
  } catch (e) { window.__CAP_BASE = window.__CAP_BASE || '/'; window.__CAP_PATH = window.__CAP_PATH || ''; }
  var BASE = 'https://demo.supabase.co';
  var D = window.CAP_DEMO_DATA;
  var Q = {}; D.questions.forEach(function (q) { Q[q.id] = q; });
  var U = {}; D.units.forEach(function (u) { U[u.id] = u; });
  var KEYS = ['A', 'B', 'C', 'D'];
  var SUBJECTS = ['math', 'chinese', 'english', 'science', 'social'];
  var CFG = { daily_goal: 5, free_daily_questions: 30, free_daily_tutor: 3, premium_daily_tutor: 50, xp_correct: 10, xp_grad: 30 };

  // ---------- 儲存（localStorage 不能用時改存記憶體） ----------
  var memStore = {};
  var store;
  try { window.localStorage.setItem('__t', '1'); window.localStorage.removeItem('__t'); store = window.localStorage; }
  catch (e) {
    store = {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(memStore, k) ? memStore[k] : null; },
      setItem: function (k, v) { memStore[k] = String(v); },
      removeItem: function (k) { delete memStore[k]; },
      clear: function () { memStore = {}; }, key: function (i) { return Object.keys(memStore)[i] || null; },
      get length() { return Object.keys(memStore).length; },
    };
    try { Object.defineProperty(window, 'localStorage', { value: store, configurable: true }); } catch (e2) { /* 忽略 */ }
  }
  var SKEY = 'cap-demo-db-v1';
  var db;
  try { db = JSON.parse(store.getItem(SKEY) || 'null'); } catch (e) { db = null; }
  if (!db) db = { users: {}, profiles: {}, attempts: [], daily: {}, met: {}, froze: {}, mistakes: {}, tutor: {}, mocks: [], links: [], apps: [], reports: [] };
  function save() { try { store.setItem(SKEY, JSON.stringify(db)); } catch (e) { /* 忽略 */ } }

  // ---------- 小工具 ----------
  function today() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date()); }
  function addDays(d, n) { var t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }
  function uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }); }
  function b64(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_'); }
  function code8() { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 8; i++) s += a[Math.floor(Math.random() * 32)]; return s; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function semesterEnd(d) { var y = +d.slice(0, 4), m = +d.slice(5, 7); return (m >= 8) ? (y + 1) + '-01-31' : (m === 1 ? y + '-01-31' : y + '-07-31'); }
  function json(data, status) {
    return new Response(data === undefined ? null : JSON.stringify(data), { status: status || 200, headers: { 'content-type': 'application/json' } });
  }
  function fail(code, status, extra) { return json(Object.assign({ code: 'P0001', message: code, error: code }, extra || {}), status || 400); }

  function sessionFor(user) {
    var exp = Math.floor(Date.now() / 1000) + 3600 * 24 * 7;
    var token = b64({ alg: 'HS256', typ: 'JWT' }) + '.' + b64({ sub: user.id, email: user.email, exp: exp, role: 'authenticated', aud: 'authenticated' }) + '.demo';
    return { access_token: token, refresh_token: 'demo-' + user.id, token_type: 'bearer', expires_in: 3600 * 24 * 7, expires_at: exp, user: publicUser(user) };
  }
  function publicUser(u) {
    return { id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email, email_confirmed_at: u.created_at,
      app_metadata: { provider: 'email' }, user_metadata: u.meta || {}, created_at: u.created_at };
  }
  function uidFrom(req) {
    var h = req.headers.get('authorization') || '';
    var t = h.replace(/^Bearer\s+/i, '');
    try { var p = JSON.parse(decodeURIComponent(escape(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))))); return p.sub || null; }
    catch (e) { return null; }
  }
  function userByEmail(email) { var k = Object.keys(db.users); for (var i = 0; i < k.length; i++) if (db.users[k[i]].email === email.toLowerCase()) return db.users[k[i]]; return null; }

  function premium(p) { return !!(p && p.premium_until && p.premium_until >= today()); }
  function publicQ(q, uid) {
    var u = U[q.unit];
    var r = { id: q.id, unit_id: q.unit, concept: q.concept, stem: q.stem,
      options: q.options.map(function (t, i) { return { key: KEYS[i], text: t }; }),
      difficulty: q.difficulty, source: 'original', subject: u.subject, semester: u.semester, unit_title: u.title,
      listen_script: q.listen ? q.listen.trim() : null };
    if (uid) r.seen = seen(uid, q.id);
    return r;
  }
  function seen(uid, qid) { return db.attempts.some(function (a) { return a.u === uid && a.q === qid; }); }
  function mistakesOf(uid) { return db.mistakes[uid] || (db.mistakes[uid] = {}); }
  function openMistake(uid, qid) { var m = mistakesOf(uid)[qid]; return !!(m && m.status !== 'graduated'); }
  function dayRow(uid, d) { var k = uid + '|' + d; return db.daily[k] || (db.daily[k] = { answered: 0, correct: 0 }); }
  function unitSemester(unitId, version) {
    var v = version && D.versions[unitId] && D.versions[unitId][version];
    return v ? v.semester : U[unitId].semester;
  }

  // ---------- 連勝 ----------
  function streakInfo(uid) {
    var met = db.met[uid] || {}, froze = db.froze[uid] || {};
    var d = today(), s = 0;
    if (!met[d]) d = addDays(d, -1);
    while (met[d] || froze[d]) { if (met[d]) s++; d = addDays(d, -1); }
    return s;
  }
  function onGoalMet(uid, p) {
    var t = today();
    db.met[uid] = db.met[uid] || {}; db.froze[uid] = db.froze[uid] || {};
    // 漏掉的天數：有保護卡就自動用
    var last = p.last_goal_date;
    if (last) {
      var gap = []; var d = addDays(last, 1);
      while (d < t) { gap.push(d); d = addDays(d, 1); }
      if (gap.length && gap.length <= p.freeze_cards) { gap.forEach(function (g) { db.froze[uid][g] = true; }); p.freeze_cards -= gap.length; }
    }
    db.met[uid][t] = true;
    p.last_goal_date = t;
    p.current_streak = streakInfo(uid);
    p.longest_streak = Math.max(p.longest_streak || 0, p.current_streak);
    if (p.current_streak % 7 === 0) p.freeze_cards = Math.min(p.freeze_cards + 1, 5);
  }

  // ---------- 資料庫函式 ----------
  var RPC = {
    get_home: function (uid) {
      var p = db.profiles[uid], t = today(), dr = dayRow(uid, t);
      var used = (db.tutor[uid + '|' + t] || { count: 0, bonus: 0 });
      var ms = mistakesOf(uid), list = Object.keys(ms).map(function (k) { return ms[k]; });
      var week = []; for (var i = 6; i >= 0; i--) { var d = addDays(t, -i); week.push({ day: d, met: !!(db.met[uid] || {})[d], froze: !!(db.froze[uid] || {})[d] }); }
      return { nickname: p.nickname, grade: p.grade, textbook: p.textbook_version, persona: p.tutor_persona, xp: p.xp,
        streak: streakInfo(uid), longest_streak: p.longest_streak || 0, freeze_cards: p.freeze_cards, premium: premium(p),
        premium_until: p.premium_until, subscribed: false, tutor_used_today: used.count,
        tutor_limit_today: premium(p) ? CFG.premium_daily_tutor : CFG.free_daily_tutor + used.bonus,
        daily_goal: CFG.daily_goal, today_answered: dr.answered,
        due_reviews: list.filter(function (m) { return ['learning', 'consolidating', 'almost'].indexOf(m.status) >= 0 && m.next_review <= t; }).length,
        pending_mistakes: list.filter(function (m) { return m.status === 'pending'; }).length, week: week, invite_code: p.invite_code };
    },
    get_limits: function () { return { free_daily_questions: CFG.free_daily_questions, free_daily_tutor: CFG.free_daily_tutor, premium_daily_tutor: CFG.premium_daily_tutor }; },
    get_units: function (uid, a) {
      var ver = a.p_version || null;
      return D.units.filter(function (u) { return u.subject === (a.p_subject || 'math'); }).map(function (u) {
        var v = ver && D.versions[u.id] && D.versions[u.id][ver];
        var qs = D.questions.filter(function (q) { return q.unit === u.id; });
        var att = {}, ok = {}, nAns = 0, nOk = 0;
        db.attempts.forEach(function (x) { if (x.u === uid && Q[x.q] && Q[x.q].unit === u.id) { att[x.q] = 1; nAns++; if (x.c) { ok[x.q] = 1; nOk++; } } });
        var mastered = Object.keys(ok).filter(function (k) { return !openMistake(uid, k); }).length;
        return { id: u.id, semester: v ? v.semester : u.semester, seq: v ? v.sort : u.seq, title: u.title,
          chapter: v ? v.chapter : null, chapter_title: v ? v.chapter_title : null, total: qs.length, mastered: mastered, attempted: Object.keys(att).length, answered: nAns, correct: nOk };
      }).sort(function (x, y) { return x.semester < y.semester ? -1 : x.semester > y.semester ? 1 : x.seq - y.seq; });
    },
    daily_questions: function (uid, a) {
      var p = db.profiles[uid], tv = p.textbook_versions || {};
      // 每日 5 題不跨學制：五、六年級只出國小單元，國中生只出國中單元（和正式版一樣）
      var elem = (p.grade || 7) <= 6;
      var units = D.units.filter(function (u) { return a.p_subjects.indexOf(u.subject) >= 0 && (/^[56]/.test(u.semester) === elem) && (!a.p_max_sem || unitSemester(u.id, tv[u.subject]) <= a.p_max_sem); })
        .map(function (u) { return u.id; });
      var bySub = {};
      shuffle(D.questions.filter(function (q) { return units.indexOf(q.unit) >= 0; })).forEach(function (q) {
        var s = U[q.unit].subject; (bySub[s] = bySub[s] || []).push(q);
      });
      Object.keys(bySub).forEach(function (s) {
        bySub[s].sort(function (x, y) { return (seen(uid, x.id) - seen(uid, y.id)) || (openMistake(uid, y.id) - openMistake(uid, x.id)); });
      });
      var out = [], i = 0, limit = Math.min(a.p_limit || 5, 50);
      while (out.length < limit && Object.keys(bySub).some(function (s) { return bySub[s].length > i; })) {
        shuffle(Object.keys(bySub)).forEach(function (s) { if (bySub[s][i] && out.length < limit) out.push(bySub[s][i]); });
        i++;
      }
      return out.map(function (q) { return publicQ(q, uid); });
    },
    practice_questions: function (uid, a) {
      var qs = shuffle(D.questions.filter(function (q) { return a.p_unit_ids.indexOf(q.unit) >= 0 && (!a.p_difficulty || q.difficulty === Number(a.p_difficulty)); }));
      qs.sort(function (x, y) { return (seen(uid, x.id) - seen(uid, y.id)) || (openMistake(uid, y.id) - openMistake(uid, x.id)); });
      return qs.slice(0, Math.min(a.p_limit || 5, 60)).map(function (q) { return publicQ(q, uid); });
    },
    question_solution: function (uid, a) {
      var q = Q[a.p_question_id];
      if (!q) throw 'question_not_found';
      if (!db.attempts.some(function (x) { return x.u === uid && x.q === q.id; })) throw 'not_answered';
      return { answer: q.answer, explanation: q.explanation, hints: q.hints || [], wrong_reasons: q.wrong || {},
        options: q.options.map(function (t, i) { return { key: KEYS[i], text: t }; }) };
    },
    similar_question: function (uid, a) {
      var src = Q[a.p_question_id];
      var cands = shuffle(D.questions.filter(function (q) { return q.unit === src.unit && q.id !== src.id; }));
      cands.sort(function (x, y) { return (y.concept === src.concept) - (x.concept === src.concept); });
      return cands.length ? [publicQ(cands[0])] : [];
    },
    submit_answer: function (uid, a) {
      var p = db.profiles[uid], q = Q[a.p_question_id], t = today();
      if (!q) throw 'question_not_found';
      if (KEYS.indexOf(a.p_choice) < 0) throw 'bad_choice';
      var dr = dayRow(uid, t);
      if (!premium(p) && dr.answered >= CFG.free_daily_questions) throw 'daily_limit_reached';
      var correct = a.p_choice === q.answer, ms = mistakesOf(uid), status = null, xp = 0;
      db.attempts.push({ u: uid, q: q.id, c: correct, ctx: a.p_context || 'practice', at: Date.now(), day: t });
      dr.answered++; if (correct) { dr.correct++; xp += CFG.xp_correct; }
      // 和正式後端 submit_answer 相同的錯題規則
      var target = a.p_for_mistake ? ms[a.p_for_mistake] : ms[q.id];
      if (!correct && !a.p_for_mistake) {
        var m = ms[q.id];
        if (m) { m.status = 'pending'; m.wrong_count++; m.next_review = t; }
        else ms[q.id] = { q: q.id, status: 'pending', error_type: null, next_review: t, wrong_count: 1, created_at: new Date().toISOString() };
        status = 'pending';
      } else if (!correct && target) {
        // 驗收題答錯：原錯題退回待講解
        target.status = 'pending'; target.next_review = t; status = 'pending';
      } else if (correct && target && target.status !== 'graduated' && (target.next_review <= t || target.status === 'pending')) {
        var adv = { pending: ['learning', 1], learning: ['consolidating', 3], consolidating: ['almost', 7], almost: ['graduated', 14] };
        var n = adv[target.status]; target.status = n[0]; target.next_review = addDays(t, n[1]); status = n[0];
        if (n[0] === 'graduated') xp += CFG.xp_grad;
      } else if (target) {
        status = target.status;
      }
      p.xp += xp;
      var up = false;
      if (dr.answered === CFG.daily_goal) { onGoalMet(uid, p); up = true; }
      save();
      return { correct: correct, answer: q.answer, explanation: q.explanation, wrong_reason: correct ? null : (q.wrong[a.p_choice] || null),
        xp_gained: xp, xp_total: p.xp, today_answered: dr.answered, daily_goal: CFG.daily_goal, streak: streakInfo(uid),
        streak_up: up, freeze_cards: p.freeze_cards, mistake_status: status };
    },
    due_reviews: function (uid, a) {
      var t = today(), ms = mistakesOf(uid);
      return Object.keys(ms).map(function (k) { return ms[k]; })
        .filter(function (m) { return ['learning', 'consolidating', 'almost'].indexOf(m.status) >= 0 && m.next_review <= t; })
        .slice(0, a.p_limit || 10).map(function (m) { return mrow(m); });
    },
    list_mistakes: function (uid) {
      var ms = mistakesOf(uid);
      return Object.keys(ms).map(function (k) { return mrow(ms[k]); }).sort(function (x, y) { return x.created_at < y.created_at ? 1 : -1; });
    },
    set_error_type: function (uid, a) { var m = mistakesOf(uid)[a.p_question_id]; if (m) m.error_type = a.p_error_type; save(); return null; },
    report_question: function (uid, a) { db.reports.push({ u: uid, q: a.p_question_id, kind: a.p_kind }); save(); return null; },
    give_ai_consent: function (uid) { db.profiles[uid].ai_consent_at = db.profiles[uid].ai_consent_at || new Date().toISOString(); save(); return null; },
    grant_ad_bonus: function () { throw 'ad_bonus_limit'; },
    apply_top_three: function (uid, a) {
      var id = uuid(), p = db.profiles[uid];
      // 試用版：自動審核通過，讓你可以體驗完整版
      db.apps.push({ id: id, user_id: uid, school: a.p_school, exam: a.p_exam, school_rank: a.p_rank, status: 'approved',
        reviewer_note: '試用版自動通過（正式版由管理員人工審核）', created_at: new Date().toISOString() });
      p.premium_until = semesterEnd(today());
      save(); return id;
    },
    link_child: function (uid, a) {
      if (db.profiles[uid].role !== 'parent') throw 'not_parent';
      var code = String(a.p_code || '').replace(/\s/g, '').toUpperCase();
      var kid = Object.keys(db.profiles).map(function (k) { return db.profiles[k]; }).filter(function (p) { return p.role === 'student' && p.invite_code === code; })[0];
      if (!kid) return { error: 'code_not_found' };
      if (!db.links.some(function (l) { return l.parent === uid && l.student === kid.id; })) db.links.push({ parent: uid, student: kid.id, at: new Date().toISOString() });
      save(); return { student_id: kid.id, nickname: kid.nickname };
    },
    my_parents: function (uid) {
      return db.links.filter(function (l) { return l.student === uid; }).map(function (l) { return { parent_id: l.parent, nickname: db.profiles[l.parent].nickname, linked_at: l.at }; });
    },
    my_children: function (uid) {
      return db.links.filter(function (l) { return l.parent === uid; }).map(function (l) { return { student_id: l.student, nickname: db.profiles[l.student].nickname, linked_at: l.at }; });
    },
    unlink_child: function (uid, a) { db.links = db.links.filter(function (l) { return !(l.parent === uid && l.student === a.p_student); }); save(); return null; },
    unlink_parent: function (uid, a) { db.links = db.links.filter(function (l) { return !(l.student === uid && l.parent === a.p_parent); }); save(); return null; },
    rotate_invite_code: function (uid) { db.profiles[uid].invite_code = code8(); save(); return db.profiles[uid].invite_code; },
    get_child_summary: function (uid, a) {
      var kid = a.p_student; if (!linked(uid, kid)) throw 'not_linked';
      var p = db.profiles[kid], t = today(), days = [];
      for (var i = 6; i >= 0; i--) { var d = addDays(t, -i), r = db.daily[kid + '|' + d] || { answered: 0, correct: 0 }; days.push({ day: d, answered: r.answered, correct: r.correct, froze: !!(db.froze[kid] || {})[d] }); }
      var since = addDays(t, -6), bySub = {}, byUnit = {};
      db.attempts.forEach(function (x) {
        if (x.u !== kid || x.day < since) return;
        var u = U[Q[x.q].unit]; var s = bySub[u.subject] = bySub[u.subject] || { subject: u.subject, answered: 0, correct: 0 }; s.answered++; if (x.c) s.correct++;
        var w = byUnit[u.id] = byUnit[u.id] || { title: u.title, semester: u.semester, answered: 0, ok: 0 }; w.answered++; if (x.c) w.ok++;
      });
      var weak = Object.keys(byUnit).map(function (k) { var w = byUnit[k]; return { title: w.title, semester: w.semester, answered: w.answered, pct: Math.round(100 * w.ok / w.answered) }; })
        .filter(function (w) { return w.answered >= 3 && w.pct < 70; }).sort(function (x, y) { return x.pct - y.pct; }).slice(0, 3);
      var ms = mistakesOf(kid), et = {};
      Object.keys(ms).forEach(function (k) { if (ms[k].error_type) et[ms[k].error_type] = (et[ms[k].error_type] || 0) + 1; });
      return { nickname: p.nickname, grade: p.grade, streak: streakInfo(kid), days: days,
        by_subject: Object.keys(bySub).map(function (k) { return bySub[k]; }), weak_units: weak.length ? weak : null,
        graduated_this_week: Object.keys(ms).filter(function (k) { return ms[k].status === 'graduated'; }).length,
        error_types: Object.keys(et).length ? et : null };
    },
    save_mock_exam: function (uid, a) {
      var ids = a.p_question_ids || [], since = Date.now() - 3 * 3600 * 1000, last = {};
      db.attempts.forEach(function (x) { if (x.u === uid && x.ctx === 'exam' && x.at > since && ids.indexOf(x.q) >= 0) last[x.q] = x.c; });
      var correct = ids.filter(function (k) { return last[k] === true; }).length;
      var answered = Object.keys(last).length, per = {};
      ids.forEach(function (k) { var u = U[Q[k].unit]; var r = per[u.id] = per[u.id] || { unit_id: u.id, title: u.title, n: 0, ok: 0 }; r.n++; if (last[k]) r.ok++; });
      var prev = db.mocks.filter(function (m) { return m.user_id === uid && m.subject === a.p_subject && m.full_length === a.p_full; }).pop();
      var row = { id: uuid(), user_id: uid, subject: a.p_subject, full_length: !!a.p_full, total: ids.length, correct: correct,
        unanswered: ids.length - answered, score: Math.round(correct * 100 / ids.length), duration_sec: a.p_duration_sec || 0,
        by_unit: Object.keys(per).map(function (k) { return per[k]; }).sort(function (x, y) { return x.ok / x.n - y.ok / y.n; }),
        created_at: new Date().toISOString() };
      db.mocks.push(row); save();
      return { id: row.id, score: row.score, correct: correct, total: ids.length, previous_score: prev ? prev.score : null };
    },
    my_mock_exams: function (uid, a) {
      return db.mocks.filter(function (m) { return m.user_id === uid && (!a.p_subject || m.subject === a.p_subject); }).slice().reverse().slice(0, a.p_limit || 30);
    },
    child_mock_exams: function (uid, a) {
      if (!linked(uid, a.p_student)) throw 'not_linked';
      return db.mocks.filter(function (m) { return m.user_id === a.p_student; }).slice().reverse().slice(0, a.p_limit || 30);
    },
  };
  function linked(parent, kid) { return db.links.some(function (l) { return l.parent === parent && l.student === kid; }); }
  function mrow(m) { return { question: publicQ(Q[m.q]), status: m.status, error_type: m.error_type, next_review: m.next_review, wrong_count: m.wrong_count, created_at: m.created_at }; }

  // ---------- 示範小老師 ----------
  var DISTRESS = /自殺|想死|不想活|活不下去|自殘|割腕|傷害自己|被霸凌|霸凌我|被欺負/;
  var SAFETY = '聽起來你現在很不好受，謝謝你願意說出來。這不是題目的問題，先暫停一下沒關係。可以找信任的大人聊聊，例如家人、導師或學校輔導室。也可以打電話：安心專線 1925（24 小時）、生命線 1995、張老師 1980。如果有立即危險，請撥 110 或 119。';
  var OPEN = { gentle: '嗨～差一點點！', funny: '哎呀，這題差一點就被你拿下了！', strict: '這題答錯了。' };
  function tutor(uid, body) {
    var p = db.profiles[uid], t = today(), q = Q[body.question_id];
    if (!p.ai_consent_at) return json({ error: 'ai_consent_required' }, 403);
    if (!q) return json({ error: 'question_not_found' }, 404);
    var key = uid + '|' + t, use = db.tutor[key] = db.tutor[key] || { count: 0, bonus: 0 };
    var limit = premium(p) ? CFG.premium_daily_tutor : CFG.free_daily_tutor + use.bonus;
    var s;
    if (body.action === 'start') {
      // 同一題今天講過：接續原本的對話，不再扣次數（和正式版一樣）
      var prevId = db['tq_' + uid + '|' + q.id + '|' + t], prev = prevId && db['ts_' + prevId];
      if (prev && prev.hist && prev.hist.length && !prev.safety) {
        var lastT = prev.hist.filter(function (x) { return x.from === 'tutor'; }).slice(-1)[0];
        return json({ session_id: prev.id, reply: lastT ? lastT.text : '', hint_level: prev.level, resumed: true, history: prev.hist,
          remaining_today: Math.max(limit - use.count, 0) });
      }
      if (use.count >= limit) return json({ error: 'daily_tutor_limit', limit: limit, premium: premium(p) }, 429);
      use.count++;
      s = { id: uuid(), level: 0 }; db['ts_' + s.id] = s;
      var choice = body.student_choice;
      var opener = OPEN[p.tutor_persona] || OPEN.gentle;
      var reply = choice
        ? opener + '你選了 (' + choice + ')，可以說說你當時是怎麼想的嗎？也可以點下面的快速回覆。'
        : '想要我陪你看哪一個部分呢？先說說你卡在哪裡吧。';
      s.hist = [{ from: 'tutor', text: reply }]; db['tq_' + uid + '|' + q.id + '|' + t] = s.id;
      save();
      return json({ session_id: s.id, reply: reply, hint_level: 0, remaining_today: Math.max(limit - use.count, 0) });
    }
    s = db['ts_' + body.session_id] || { id: body.session_id, level: 0 };
    var hints = q.hints || [], et = null, out;
    if (body.action === 'reply') {
      var m = String(body.message || '');
      if (DISTRESS.test(m)) { s.safety = true; db['ts_' + s.id] = s; save(); return json({ session_id: s.id, reply: SAFETY, safety: true, hint_level: s.level }); }
      if (/卡住|算/.test(m)) et = 'calculation'; else if (/猜/.test(m)) et = 'guess';
      else if (/看不懂|句子意思/.test(m)) et = 'misread'; else if (/公式|觀念|文法|單字|不記得|不懂這個詞/.test(m)) et = 'concept';
      out = '了解，謝謝你告訴我！' + (hints[s.level] ? '我們先從這裡想：' + hints[s.level] : '再看一次題目，找出關鍵的條件。') + ' 想到了就跟我說，或按「給我提示」。';
    } else if (body.action === 'hint') {
      s.level = Math.min(s.level + 1, 3);
      out = s.level >= 3 || !hints[s.level - 1]
        ? '完整解法：' + q.explanation + ' 你可以用自己的話把關鍵步驟說一次嗎？'
        : '提示 ' + s.level + '：' + hints[s.level - 1];
    } else {
      out = '換個方式想想看：' + (hints[0] || '') + ' ' + (hints[1] ? '接著，' + hints[1] : '');
    }
    if (et) { var mm = mistakesOf(uid)[q.id]; if (mm && !mm.error_type) mm.error_type = et; }
    var said = body.action === 'reply' ? String(body.message || '') : body.action === 'hint' ? (s.level >= 3 ? '給我完整解法' : '給我一個提示') : '聽不懂，可以換個方式講嗎？';
    s.hist = (s.hist || []).concat([{ from: 'me', text: said }, { from: 'tutor', text: '（示範回覆）' + out }]);
    db['ts_' + s.id] = s; save();
    return json({ session_id: s.id, reply: '（示範回覆）' + out, hint_level: s.level, error_type: et, understood: false, safety: false });
  }

  // ---------- 路由 ----------
  function body(init) { try { return init && init.body ? JSON.parse(init.body) : {}; } catch (e) { return {}; } }
  function newProfile(user, meta) {
    return { id: user.id, role: meta.role === 'parent' ? 'parent' : 'student', nickname: String(meta.nickname || '同學').slice(0, 20),
      grade: null, textbook_version: null, tutor_persona: 'gentle', xp: 0, current_streak: 0, longest_streak: 0, last_goal_date: null,
      freeze_cards: 2, premium_until: null, subscription_until: null, invite_code: code8(), ai_consent_at: null,
      daily_subjects: SUBJECTS.slice(), textbook_versions: {}, grade_confirmed_at: null,
      parent_consent_at: meta.parent_consent === 'true' ? new Date().toISOString() : null,
      terms_accepted_at: meta.terms_accepted === 'true' ? new Date().toISOString() : null, created_at: new Date().toISOString() };
  }

  function handle(url, init, req) {
    var path = url.pathname, method = (init && init.method || 'GET').toUpperCase(), b = body(init);
    // ---- 登入 ----
    if (path === '/auth/v1/signup') {
      var email = String(b.email || '').trim().toLowerCase();
      if (userByEmail(email)) return json({ code: 422, error_code: 'user_already_exists', msg: 'User already registered' }, 422);
      var user = { id: uuid(), email: email, password: b.password, meta: b.data || {}, created_at: new Date().toISOString() };
      db.users[user.id] = user; db.profiles[user.id] = newProfile(user, b.data || {}); save();
      return json(sessionFor(user));
    }
    if (path === '/auth/v1/token') {
      var gt = url.searchParams.get('grant_type');
      if (gt === 'password') {
        var u = userByEmail(String(b.email || '').trim());
        if (!u || u.password !== b.password) return json({ error: 'invalid_grant', error_description: 'Invalid login credentials', code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400);
        return json(sessionFor(u));
      }
      var rid = String(b.refresh_token || '').replace(/^demo-/, '');
      if (db.users[rid]) return json(sessionFor(db.users[rid]));
      return json({ error: 'invalid_grant', error_description: 'Invalid Refresh Token' }, 400);
    }
    if (path === '/auth/v1/user') {
      var id = uidFrom(req); if (!id || !db.users[id]) return json({ msg: 'invalid JWT' }, 401);
      if (method === 'PUT') { if (b.password) db.users[id].password = b.password; save(); }
      return json(publicUser(db.users[id]));
    }
    if (path === '/auth/v1/logout') return json(undefined, 204);
    if (path === '/auth/v1/recover' || path === '/auth/v1/resend' || path === '/auth/v1/otp') return json({});
    if (path === '/auth/v1/verify') {
      var vu = userByEmail(String(b.email || '').trim());
      if (!vu || !/^\d{6}$/.test(String(b.token || ''))) return json({ error_code: 'otp_expired', msg: 'Token has expired or is invalid' }, 403);
      return json(sessionFor(vu));
    }

    var uid = uidFrom(req);
    if (!uid || !db.profiles[uid]) return json({ message: 'not_authenticated' }, 401);

    // ---- 資料表 ----
    if (path === '/rest/v1/profiles') {
      if (method === 'PATCH') {
        var allowed = ['nickname', 'grade', 'textbook_version', 'tutor_persona', 'daily_subjects', 'textbook_versions'];
        Object.keys(b).forEach(function (k) { if (allowed.indexOf(k) >= 0) db.profiles[uid][k] = b[k]; });
        if ('grade' in b) db.profiles[uid].grade_confirmed_at = new Date().toISOString();
        save(); return json(undefined, 204);
      }
      return json(db.profiles[uid]);
    }
    if (path === '/rest/v1/questions_public') {
      var qid = (url.searchParams.get('id') || '').replace(/^eq\./, '');
      return Q[qid] ? json(publicQ(Q[qid])) : json({ code: 'PGRST116', message: 'not found' }, 406);
    }
    if (path === '/rest/v1/top_three_applications') return json(db.apps.filter(function (x) { return x.user_id === uid; }).slice().reverse());
    if (path === '/rest/v1/parent_links') return json(db.links.filter(function (l) { return l.parent === uid; }).map(function (l) { return { student_id: l.student }; }));
    if (path.indexOf('/storage/v1/object/') === 0) return json({ Key: path.replace('/storage/v1/object/', ''), Id: uuid() });

    // ---- 資料庫函式 ----
    if (path.indexOf('/rest/v1/rpc/') === 0) {
      var fn = RPC[path.slice('/rest/v1/rpc/'.length)];
      if (!fn) return fail('not_supported_in_demo', 404);
      try { var out = fn(uid, b); save(); return json(out === undefined ? null : out); }
      catch (e) { return fail(String(e)); }
    }

    // ---- 伺服器函式 ----
    if (path === '/functions/v1/tutor') return tutor(uid, b);
    if (path === '/functions/v1/delete-account') {
      delete db.users[uid]; delete db.profiles[uid]; delete db.mistakes[uid];
      db.attempts = db.attempts.filter(function (a) { return a.u !== uid; });
      db.links = db.links.filter(function (l) { return l.parent !== uid && l.student !== uid; });
      db.mocks = db.mocks.filter(function (m) { return m.user_id !== uid; });
      save(); return json({ ok: true });
    }
    if (path === '/functions/v1/sync-subscription') return json({ ok: true, subscription_until: null });
    return fail('not_supported_in_demo', 404);
  }

  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || String(input);
    if (url.indexOf(BASE) !== 0) return realFetch(input, init);
    var req = input instanceof Request ? input : new Request(url, init);
    var finalInit = init || {};
    var go = function (bodyText) {
      if (bodyText !== undefined) finalInit = Object.assign({}, finalInit, { body: bodyText, method: req.method });
      if (!finalInit.method) finalInit = Object.assign({}, finalInit, { method: req.method });
      return new Promise(function (resolve) {
        setTimeout(function () {
          try { resolve(handle(new URL(url), finalInit, req)); }
          catch (e) { console.error('demo backend error', e); resolve(json({ message: 'demo_error' }, 500)); }
        }, 60);
      });
    };
    if (input instanceof Request && !(init && init.body)) {
      return (req.method === 'GET' || req.method === 'HEAD') ? go() : req.clone().text().then(go);
    }
    if (finalInit.body && typeof finalInit.body !== 'string') {
      // 上傳檔案等非文字內容：不需要讀內容
      return go('{}');
    }
    return go();
  };
  // 載入 App 主程式（用實際檔案位置組出完整網址；主程式裡的頁面路徑會讀 window.__CAP_PATH）
  if (window.__CAP_ENTRY) {
    var sc = document.createElement('script');
    sc.src = window.__CAP_BASE + window.__CAP_ENTRY;
    sc.defer = true;
    document.body ? document.body.appendChild(sc) : document.head.appendChild(sc);
  }
  window.CAP_DEMO_RESET = function () { try { store.removeItem(SKEY); } catch (e) { /* 忽略 */ } location.reload(); };
})();
