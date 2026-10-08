#!/usr/bin/env bash
# 產生網頁試用版到 demo/dist（可放到任何靜態網站）
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/build_seed.py >/dev/null
python3 scripts/build_demo_data.py
rm -rf demo/dist
# 頁面路徑先用 /__CAPBASE__ 打包，之後換成執行時才知道的實際位置（window.__CAP_PATH）
cp app/app.json /tmp/cap-app.json.bak
trap 'cp /tmp/cap-app.json.bak app/app.json' EXIT
python3 - <<'PY'
import json
p = 'app/app.json'; d = json.load(open(p, encoding='utf-8'))
d['expo']['experiments']['baseUrl'] = '/__CAPBASE__'
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
PY
(cd app && EXPO_PUBLIC_DEMO=1 EXPO_PUBLIC_SUPABASE_URL=https://demo.supabase.co EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=demo \
  npx expo export --platform web --clear --output-dir ../demo/dist >/dev/null)
cp /tmp/cap-app.json.bak app/app.json
cp demo/demo-data.js demo/demo-backend.js demo/dist/
python3 - <<'PY'
from pathlib import Path
p = Path('demo/dist/index.html'); s = p.read_text(encoding='utf-8')
inject = '<script src="./demo-data.js"></script><script src="./demo-backend.js"></script>'
s = s.replace('/__CAPBASE__/', '/').replace('<html lang="en">', '<html lang="zh-Hant-TW">')
s = s.replace('<script src="/_expo', inject + '<script src="./_expo', 1) if '<script src="/_expo' in s else s.replace('</head>', inject + '</head>', 1)
s = s.replace('<title>', '<title>', 1)
p.write_text(s, encoding='utf-8')
print('index.html 已加入試用版後端')
PY
# 發布成 Artifact 用的頁面：去掉外層 <html><head><body>（發布時會自動加上），保留標題、樣式、根節點與程式
python3 - <<'PY'
import re
from pathlib import Path
s = Path('demo/dist/index.html').read_text(encoding='utf-8')
style = re.search(r'<style id="expo-reset">.*?</style>', s, re.S).group(0)
scripts = ''.join(re.findall(r'<script[^>]*></script>', s))
page = ('<title>會考小老師</title>\n' + style +
        '\n<style>html,body{background:#F6F3EC;margin:0}:root{padding:0!important}</style>\n'
        '<div id="root"></div>\n' + scripts + '\n')
Path('demo/dist/page.html').write_text(page, encoding='utf-8')
print('page.html 完成')
PY
# 發布服務不允許「_」開頭的路徑：把程式檔搬到 app/
mkdir -p demo/dist/app
for f in demo/dist/_expo/static/js/web/*.js; do mv "$f" demo/dist/app/; done
rm -rf demo/dist/_expo
sed -i 's#\./_expo/static/js/web/#./app/#g; s#/_expo/static/js/web/#./app/#g' demo/dist/page.html demo/dist/index.html
# 主程式改由 demo-backend.js 依實際位置載入（避免子路徑時相對網址算錯）
python3 - <<'PY'
import re
from pathlib import Path
for name in ['page.html', 'index.html']:
    p = Path('demo/dist') / name
    s = p.read_text(encoding='utf-8')
    m = re.search(r'<script src="\./(app/entry-[^"]+\.js)" defer></script>', s)
    s = s.replace(m.group(0), '')
    s = s.replace('<script src="./demo-backend.js"></script>', f'<script src="./demo-backend.js" data-entry="{m.group(1)}"></script>')
    p.write_text(s, encoding='utf-8')
PY
# 網頁可能放在子路徑（例如 /_f/版本號）：頁面路徑、圖示與圖片改成依實際位置（window.__CAP_PATH）
python3 - <<'PY'
from pathlib import Path
for f in Path('demo/dist/app').glob('*.js'):
    s = f.read_text(encoding='utf-8')
    n1 = s.count('"/__CAPBASE__/'); s = s.replace('"/__CAPBASE__/', '(window.__CAP_PATH||"")+"/')
    n2 = s.count('"/__CAPBASE__"'); s = s.replace('"/__CAPBASE__"', '(window.__CAP_PATH||"")')
    assert s.count('"/assets/') == n1, '還有沒換到的資源路徑'
    left = s.count('__CAPBASE__')
    f.write_text(s, encoding='utf-8')
    print(f'資源路徑 {n1} 處、頁面路徑 {n2} 處改為依實際位置（設定資料裡保留 {left} 處）')
PY
# 每個 App 頁面放一份同樣的 HTML（例如 me、learn），在任何頁面重新整理都打得開
python3 - <<'PY'
from pathlib import Path
src = Path('demo/dist/index.html').read_text(encoding='utf-8')
routes = ['learn', 'mistakes', 'me', 'quiz', 'tutor', 'top-three', 'paywall', 'help', 'mock-exam', 'onboarding', 'login', 'forgot']
for r in routes: (Path('demo/dist') / r).write_text(src, encoding='utf-8')
print('頁面副本：' + '、'.join(routes))
PY
find demo/dist -type f | wc -l
du -sh demo/dist
