create extension if not exists pgcrypto;

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  test_name text,
  user_identifier text,
  language text not null,
  total_questions int not null,
  correct int not null,
  score numeric(5,2) generated always as ((correct::numeric / nullif(total_questions,0)) * 100) stored,
  pass boolean not null,
  pass_threshold int not null default 70,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

alter table quiz_attempts enable row level security;

create policy "allow_public_insert" on quiz_attempts
for insert
to public
with check (true);

create policy "admin_read" on quiz_attempts
for select
to authenticated
using (true);

create index if not exists quiz_attempts_created_at_idx on quiz_attempts (created_at desc);
create index if not exists quiz_attempts_language_idx on quiz_attempts (language);
create index if not exists quiz_attempts_pass_idx on quiz_attempts (pass);
