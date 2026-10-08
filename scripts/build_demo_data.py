# -*- coding: utf-8 -*-
"""產生網頁試用版用的題庫資料 demo/demo-data.js（含答案，只給試用版使用，不會進正式 App）"""
import importlib, json
from pathlib import Path
import build_seed as bs

ROOT = Path(__file__).resolve().parent.parent
units = []
for subject, names in list(bs.SUBJECTS.items()) + list(bs.ELEMENTARY.items()):
    for n in names:
        m = importlib.import_module(n)
        units += [(u[0], subject, u[1], u[2], u[3]) for u in getattr(m, "UNITS", [])]
version_rows, units = bs.load_versions(units)
versions = {}
for u, v, sem, ch, t, sort, conf in version_rows:
    versions.setdefault(u, {})[v] = {"semester": sem, "chapter": ch, "chapter_title": t, "sort": sort}
qs = []
for subject in bs.SUBJECTS:
    for q in json.loads((ROOT / "supabase" / "seed" / f"questions_{subject}.json").read_text(encoding="utf-8")):
        qs.append({k: q.get(k) for k in ["id", "unit", "concept", "stem", "options", "answer", "explanation", "hints", "wrong", "difficulty", "listen"]})
data = {"units": [{"id": u, "subject": s, "semester": sem, "seq": seq, "title": t} for u, s, sem, seq, t in units],
        "versions": versions, "questions": qs}
out = ROOT / "demo" / "demo-data.js"
out.write_text("window.CAP_DEMO_DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
print(f"{out}：{len(units)} 單元、{len(qs)} 題、{out.stat().st_size // 1024} KB")
