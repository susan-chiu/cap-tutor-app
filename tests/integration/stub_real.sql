-- 整合測試用：模擬 Supabase 的角色、auth、storage 結構（正式環境由 Supabase 提供）
\i ../supabase_stub.sql
alter table auth.users add column if not exists encrypted_password text;
alter table auth.users add column if not exists email_confirmed_at timestamptz;
alter table auth.users add column if not exists created_at timestamptz default now();
create unique index if not exists users_email_idx on auth.users (lower(email));
grant usage on schema storage to service_role;
grant all on storage.objects, storage.buckets to service_role;
grant all on all tables in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
