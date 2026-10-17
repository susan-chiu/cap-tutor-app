# -*- coding: utf-8 -*-
"""
驗證全部題庫並產生 supabase/seed.sql 與 supabase/seed/questions_<科目>.json
執行：python scripts/build_seed.py
驗證項目（見 check_bank.py）：選項數量、選項不重複、答案存在、每個錯誤選項都有錯誤原因、2～3 層提示、
         驗算式 check 執行結果為 True、每個觀念至少 2 題（相似題驗收需要）、題幹不重複。

題號依「單元＋在該單元中的順序」產生（例如 M-7A-1-07），已上線的題目不能刪除或調換順序，
新題請加在各檔案的最後面，或新增擴充檔並加到 SUBJECTS 清單的最後。
"""
import importlib
import json
import random
import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from check_bank import check  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
KEYS = ["A", "B", "C", "D"]
ORDERED_SETS = [{"第一象限", "第二象限", "第三象限", "第四象限"}]

# 科目 → 題庫模組（順序很重要：決定題號）
# 新題庫檔一律加在各科清單最後面（題號依順序產生，已上線的題目不能換號）
SUBJECTS = {
    "math": ["questions_math", "questions_math_x1", "questions_math_x2", "questions_math_x3", "questions_math_x4",
             "questions_math_hard_a", "questions_math_hard_b"],
    "chinese": ["questions_chinese", "questions_chinese_hard"],
    "english": ["questions_english", "questions_english_listening", "questions_english_hard"],
    "science": ["questions_science_a", "questions_science_b", "questions_science_hard_a", "questions_science_hard_b"],
    "social": ["questions_social_a", "questions_social_b", "questions_social_hard_a", "questions_social_hard_b"],
}
SUBJECT_LABEL = {"math": "數學", "chinese": "國文", "english": "英語", "science": "自然", "social": "社會"}
MIN_PER_UNIT = {"math": 20, "chinese": 10, "english": 12, "science": 10, "social": 10}
# 國小高年級（五、六年級）題庫：科目代碼和國中共用，學期是 5A～6B，每單元 15 題
ELEMENTARY = {
    "math": ["questions_elem_math_5a", "questions_elem_math_5b", "questions_elem_math_6a", "questions_elem_math_6b"],
    "chinese": ["questions_elem_chinese_5a", "questions_elem_chinese_5b", "questions_elem_chinese_6a", "questions_elem_chinese_6b"],
}
ELEMENTARY_MIN = 15
GROUPS = [(s, n, MIN_PER_UNIT[s], "") for s, n in SUBJECTS.items()] + \
         [(s, n, ELEMENTARY_MIN, "國小") for s, n in ELEMENTARY.items()]


def shuffle(q, qid):
    """依題號固定亂數打亂選項，避免答案都在同一個位置"""
    opts = q["options"]
    if set(opts) in ORDERED_SETS:
        return q
    rng = random.Random(qid)
    order = list(range(len(opts)))
    rng.shuffle(order)
    new_opts = [opts[i] for i in order]
    old_to_new = {KEYS[old]: KEYS[new] for new, old in enumerate(order)}
    return dict(q, options=new_opts, answer=old_to_new[q["answer"]],
                wrong={old_to_new[k]: v for k, v in q["wrong"].items()})


SEM_LABEL = {"七上": "7A", "七下": "7B", "八上": "8A", "八下": "8B", "九上": "9A", "九下": "9B"}
PART_RANK = {"地理": 1, "歷史": 2, "公民": 3}


def chapter_key(chapter):
    """章節排序：社會先依地理／歷史／公民，再依第一個數字；以其他學期開頭的（跨學期單元）排最後"""
    if chapter[:2] in SEM_LABEL:
        return (9, 99)
    part = next((r for k, r in PART_RANK.items() if chapter.startswith(k)), 0)
    m = re.search(r"\d+", chapter)
    return (part, int(m.group()) if m else 99)


def load_versions(units):
    """讀 scripts/versions/<科目>.json，回傳 unit_versions 資料列，並把 units 的預設學期改成三家版本多數的安排"""
    rows = []
    placement = {}   # unit -> [(version, semester, key)]
    for f in sorted((Path(__file__).parent / "versions").glob("*.json")):
        if f.name == "units_for_research.json":
            continue
        data = json.loads(f.read_text(encoding="utf-8"))
        for version, items in data["versions"].items():
            ordered = sorted(items, key=lambda r: (r["semester"], chapter_key(r["chapter"]), r["unit"]))
            for i, r in enumerate(ordered, 1):
                rows.append((r["unit"], version, r["semester"], r["chapter"], r["title"], i, r.get("confidence", "medium")))
                placement.setdefault(r["unit"], []).append((version, r["semester"], i))
    known = {u[0] for u in units}
    missing = [r[0] for r in rows if r[0] not in known]
    if missing:
        raise SystemExit(f"版本對照有未知單元：{sorted(set(missing))}")
    new_units = []
    for uid, subject, sem, seq, title in units:
        if uid in placement:
            sems = Counter(p[1] for p in placement[uid])
            sem = sems.most_common(1)[0][0]
        new_units.append([uid, subject, sem, seq, title])
    # 預設順序：同科同學期內，依各版本排序位置的平均
    avg = {uid: sum(p[2] for p in ps) / len(ps) for uid, ps in placement.items()}
    by_group = {}
    for u in new_units:
        by_group.setdefault((u[1], u[2]), []).append(u)
    for group in by_group.values():
        group.sort(key=lambda u: (avg.get(u[0], u[3]), u[3], u[0]))
        for i, u in enumerate(group, 1):
            u[3] = i
    return rows, [tuple(u) for u in new_units]


def sql_str(s):
    return "'" + s.replace("'", "''") + "'"


def main():
    all_errors = []
    units = []           # (id, subject, semester, seq, title)
    rows = []            # (qid, subject, q)
    summary = []
    for subject, names, min_per_unit, stage in GROUPS:
        errors, stat = check(names, min_per_unit)
        all_errors += [f"[{stage}{SUBJECT_LABEL[subject]}] {e}" for e in errors]
        mods = [importlib.import_module(n) for n in names]
        for m in mods:
            declared = getattr(m, "SUBJECT", subject)
            if declared != subject:
                all_errors.append(f"{m.__name__} 的 SUBJECT 是 {declared}，但被放在 {subject}")
            units += [(u[0], subject, u[1], u[2], u[3]) for u in getattr(m, "UNITS", [])]
        counters = Counter()
        for m in mods:
            for q in m.QUESTIONS:
                counters[q["unit"]] += 1
                qid = f"{q['unit']}-{counters[q['unit']]:02d}"
                rows.append((qid, subject, shuffle(q, qid)))
        summary.append(f"{stage}{('國語' if stage and subject == 'chinese' else SUBJECT_LABEL[subject])} {stat['units']} 單元 {stat['questions']} 題")

    if all_errors:
        print("題庫驗證失敗：")
        for e in all_errors:
            print("  - " + e)
        sys.exit(1)

    version_rows, units = load_versions(units)

    ids = [r[0] for r in rows]
    assert len(ids) == len(set(ids)), "題號重複"
    answers = Counter(q["answer"] for _, _, q in rows)

    out = ["-- 由 scripts/build_seed.py 產生，請勿手動修改", "begin;"]
    out.append("insert into public.units (id, subject, semester, seq, title) values")
    out.append(",\n".join(f"  ({sql_str(u)}, {sql_str(s)}, {sql_str(sem)}, {n}, {sql_str(t)})" for u, s, sem, n, t in units))
    out.append("on conflict (id) do update set subject = excluded.subject, semester = excluded.semester, seq = excluded.seq, title = excluded.title;")
    # 各版本的學期與章節對照
    out.append("delete from public.unit_versions;")
    out.append("insert into public.unit_versions (unit_id, version, semester, chapter, chapter_title, sort, confidence) values")
    out.append(",\n".join("  (" + ", ".join([sql_str(u), sql_str(v), sql_str(sem), sql_str(ch), sql_str(t), str(n), sql_str(c)]) + ")"
                          for u, v, sem, ch, t, n, c in version_rows) + ";")
    # 分批寫入，避免單一語句太大（Supabase SQL Editor 也比較好執行）
    for start in range(0, len(rows), 200):
        out.append("insert into public.questions (id, unit_id, concept, stem, options, answer, explanation, hints, wrong_reasons, difficulty, source, listen_script) values")
        vals = []
        for qid, _, q in rows[start:start + 200]:
            options = json.dumps([{"key": KEYS[i], "text": t} for i, t in enumerate(q["options"])], ensure_ascii=False)
            vals.append("  (" + ", ".join([
                sql_str(qid), sql_str(q["unit"]), sql_str(q["concept"]), sql_str(q["stem"]),
                sql_str(options) + "::jsonb", sql_str(q["answer"]), sql_str(q["explanation"]),
                sql_str(json.dumps(q["hints"], ensure_ascii=False)) + "::jsonb",
                sql_str(json.dumps(q["wrong"], ensure_ascii=False)) + "::jsonb",
                str(q["difficulty"]), "'original'",
                sql_str(q["listen"].strip()) if q.get("listen") else "null",
            ]) + ")")
        out.append(",\n".join(vals))
        out.append("on conflict (id) do update set unit_id = excluded.unit_id, concept = excluded.concept, stem = excluded.stem, "
                   "options = excluded.options, answer = excluded.answer, explanation = excluded.explanation, "
                   "hints = excluded.hints, wrong_reasons = excluded.wrong_reasons, difficulty = excluded.difficulty, "
                   "listen_script = excluded.listen_script;")
    out.append("commit;")
    (ROOT / "supabase" / "seed.sql").write_text("\n".join(out) + "\n", encoding="utf-8")

    seed_dir = ROOT / "supabase" / "seed"
    seed_dir.mkdir(exist_ok=True)
    for subject in SUBJECTS:
        (seed_dir / f"questions_{subject}.json").write_text(json.dumps(
            [dict(id=qid, **{k: v for k, v in q.items() if k != "check"}) for qid, s, q in rows if s == subject],
            ensure_ascii=False, indent=2), encoding="utf-8")

    n_checks = sum(1 for _, _, q in rows if q.get("check"))
    print(f"題庫驗證通過：{len(units)} 個單元、{len(rows)} 題（{'、'.join(summary)}），驗算式 {n_checks} 題全部成立")
    print(f"版本章節對照：{len(version_rows)} 筆（康軒、南一、翰林；國文不分版本）")
    print("答案位置分布：" + "、".join(f"{k} {answers[k]} 題" for k in KEYS))


if __name__ == "__main__":
    main()
