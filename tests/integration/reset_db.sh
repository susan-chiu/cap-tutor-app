#!/usr/bin/env bash
# 重建整合測試用資料庫：stub → migrations → seed
# 用法：DATABASE_URL=postgres://postgres@127.0.0.1:55432/capapp bash tests/integration/reset_db.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
URL="${DATABASE_URL:-postgres://postgres@127.0.0.1:55432/capapp}"
ADMIN_URL="${URL%/*}/postgres"
DB="${URL##*/}"
psql "$ADMIN_URL" -qc "drop database if exists $DB with (force)" -c "create database $DB"
(cd tests/integration && psql "$URL" -q -v ON_ERROR_STOP=1 -f stub_real.sql)
for f in supabase/migrations/*.sql; do psql "$URL" -q -v ON_ERROR_STOP=1 -f "$f"; done
psql "$URL" -q -v ON_ERROR_STOP=1 -f supabase/seed.sql
echo "資料庫已重建：$DB"
