# -*- coding: utf-8 -*-
"""
盲測驗證（不看答案重新作答，比對答案鍵）
  匯出題目（不含答案）：python3 blind_review.py export <模組> <輸出.json>
  比對作答結果：        python3 blind_review.py compare <模組> <作答.json>
作答檔格式：{"<模組>#1": "B", "<模組>#2": "D", ...}
"""
import importlib
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
KEYS = ["A", "B", "C", "D"]


def shuffled(mod_name, i, q):
    rng = random.Random(f"review-{mod_name}-{i}")
    order = list(range(4))
    rng.shuffle(order)
    opts = [q["options"][k] for k in order]
    answer = KEYS[order.index(KEYS.index(q["answer"]))]
    return opts, answer


def main():
    cmd, mod_name, path = sys.argv[1], sys.argv[2], sys.argv[3]
    mod = importlib.import_module(mod_name)
    units = {u[0]: u[3] for u in getattr(mod, "UNITS", [])}
    if cmd == "export":
        items = []
        for i, q in enumerate(mod.QUESTIONS, 1):
            opts, _ = shuffled(mod_name, i, q)
            items.append({"id": f"{mod_name}#{i}", "unit": units.get(q["unit"], q["unit"]), "stem": q["stem"],
                          "options": {KEYS[k]: o for k, o in enumerate(opts)},
                          **({"listen": q["listen"]} if q.get("listen") else {})})
        Path(path).write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"匯出 {len(items)} 題到 {path}")
    elif cmd == "compare":
        given = json.loads(Path(path).read_text(encoding="utf-8"))
        bad = 0
        missing = 0
        for i, q in enumerate(mod.QUESTIONS, 1):
            qid = f"{mod_name}#{i}"
            opts, key = shuffled(mod_name, i, q)
            g = given.get(qid)
            if g is None:
                missing += 1
                continue
            if g.strip().upper() != key:
                bad += 1
                print(f"\n=== {qid}（原始檔第 {i} 題，單元 {q['unit']}）")
                print("題目：" + q["stem"])
                for k, o in enumerate(opts):
                    mark = "（答案鍵）" if KEYS[k] == key else ("（你的作答）" if KEYS[k] == g.strip().upper() else "")
                    print(f"  ({KEYS[k]}) {o}{mark}")
                print("解析：" + q["explanation"])
        total = len(mod.QUESTIONS)
        print(f"\n共 {total} 題，作答 {total - missing} 題，不一致 {bad} 題，未作答 {missing} 題")


if __name__ == "__main__":
    main()
