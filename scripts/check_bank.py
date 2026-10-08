# -*- coding: utf-8 -*-
"""
檢查單一題庫檔：python3 check_bank.py <模組名稱> [<模組名稱> ...]
數學擴充檔（沒有 UNITS）會和 questions_math.py 合併檢查觀念題數。
"""
import importlib
import re
import sys
from collections import Counter
from fractions import Fraction
import math
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

KEYS = ["A", "B", "C", "D"]
BANNED_OPTIONS = re.compile(r"以上皆是|以上皆非|以上都是|以上都不是|all of the above|none of the above|[甲乙丙丁ABCD]和[甲乙丙丁ABCD]$", re.I)
SAFE = {"F": Fraction, "math": math, "abs": abs, "round": round, "min": min, "max": max, "sum": sum,
        "sorted": sorted, "range": range, "all": all, "any": any, "len": len, "int": int, "float": float}


def validate(q, qid, errors, unit_ids):
    if q["unit"] not in unit_ids:
        errors.append(f"{qid}: 單元 {q['unit']} 不在單元清單中")
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", q["concept"] or ""):
        errors.append(f"{qid}: 觀念標籤要用英文小寫與連字號（目前：{q['concept']}）")
    if q["difficulty"] not in (1, 2, 3):
        errors.append(f"{qid}: 難度要是 1、2、3")
    opts = q["options"]
    if len(opts) != 4:
        errors.append(f"{qid}: 需要 4 個選項")
    if len(set(o.strip() for o in opts)) != len(opts):
        errors.append(f"{qid}: 選項重複")
    for o in opts:
        if not o.strip():
            errors.append(f"{qid}: 有空白選項")
        if BANNED_OPTIONS.search(o.strip()):
            errors.append(f"{qid}: 不可使用依賴位置的選項「{o}」")
    if q["answer"] not in KEYS[: len(opts)]:
        errors.append(f"{qid}: 答案 {q['answer']} 不在選項中")
    wrong_keys = {k for k in KEYS[: len(opts)] if k != q["answer"]}
    if set(q["wrong"].keys()) != wrong_keys:
        errors.append(f"{qid}: 錯誤原因要剛好對應 {sorted(wrong_keys)}，目前是 {sorted(q['wrong'].keys())}")
    if not 2 <= len(q["hints"]) <= 3:
        errors.append(f"{qid}: 提示要 2～3 層")
    if len(q["explanation"]) < 10:
        errors.append(f"{qid}: 解析太短")
    if len(q["stem"]) < 4:
        errors.append(f"{qid}: 題幹太短")
    listen = q.get("listen")
    if listen is not None:
        lines = [ln.strip() for ln in listen.strip().splitlines() if ln.strip()]
        if not lines:
            errors.append(f"{qid}: 聽力原文是空的")
        for ln in lines:
            if not re.match(r"^(M|W|N):\s*\S", ln):
                errors.append(f"{qid}: 聽力原文每行要用 M:（男聲）、W:（女聲）或 N:（旁白）開頭：{ln[:30]}")
            if re.search(r"[\u4e00-\u9fff]", ln):
                errors.append(f"{qid}: 聽力原文只能有英文：{ln[:30]}")
    elif str(q.get("unit", "")).startswith("EN-") and "L-" in str(q.get("unit", "")):
        errors.append(f"{qid}: 聽力單元的題目要有 listen（聽力原文）")
    if q.get("check"):
        try:
            ok = eval(q["check"], dict(SAFE))
        except Exception as e:  # noqa: BLE001
            errors.append(f"{qid}: 驗算式執行失敗 {e}（{q['check']}）")
        else:
            if ok is not True:
                errors.append(f"{qid}: 驗算式結果不是 True（{q['check']}）")


def load(name):
    mod = importlib.import_module(name)
    return mod


def check(names, min_per_unit=None, quiet=False):
    """回傳 (errors, 統計)。names 是同一科目的模組清單（第一個提供 UNITS，數學擴充檔自動加上 questions_math）"""
    mods = [load(n) for n in names]
    if not any(getattr(m, "UNITS", None) for m in mods):
        mods = [load("questions_math")] + mods
    units = [u for m in mods for u in getattr(m, "UNITS", [])]
    unit_ids = {u[0] for u in units}
    errors = []
    if len(unit_ids) != len(units):
        errors.append("單元代碼重複")
    counts = Counter()
    concepts = Counter()
    checks = 0
    for m in mods:
        for i, q in enumerate(m.QUESTIONS, 1):
            qid = f"{m.__name__}#{i}（{q.get('unit')}：{q.get('stem', '')[:18]}）"
            validate(q, qid, errors, unit_ids)
            counts[q["unit"]] += 1
            concepts[(q["unit"], q["concept"])] += 1
            checks += 1 if q.get("check") else 0
    for (u, c), n in concepts.items():
        if n < 2:
            errors.append(f"{u} 的觀念 {c} 只有 {n} 題（至少要 2 題）")
    for u in sorted(unit_ids):
        if counts[u] == 0:
            errors.append(f"單元 {u} 沒有題目")
        elif min_per_unit and counts[u] < min_per_unit:
            errors.append(f"單元 {u} 只有 {counts[u]} 題（目標 {min_per_unit} 題）")
    stems = Counter(q["stem"].strip() for m in mods for q in m.QUESTIONS)
    for s, n in stems.items():
        if n > 1:
            errors.append(f"題幹重複 {n} 次：{s[:30]}")
    return errors, dict(units=len(unit_ids), questions=sum(counts.values()), checks=checks, per_unit=dict(sorted(counts.items())))


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--min=")]
    mins = [int(a[6:]) for a in sys.argv[1:] if a.startswith("--min=")]
    if not args:
        print(__doc__)
        sys.exit(2)
    errs, stat = check(args, mins[0] if mins else None)
    print(f"單元 {stat['units']} 個、題目 {stat['questions']} 題、驗算式 {stat['checks']} 題")
    print("各單元題數：" + "、".join(f"{u} {n}" for u, n in stat["per_unit"].items()))
    if errs:
        print(f"\n發現 {len(errs)} 個問題：")
        for e in errs:
            print("  - " + e)
        sys.exit(1)
    print("檢查通過")
