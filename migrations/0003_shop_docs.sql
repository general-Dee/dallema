create table if not exists shop_docs (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
