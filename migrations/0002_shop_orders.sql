create table if not exists shop_orders (
  id text primary key,
  number text not null unique,
  status text not null,
  payment_status text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists shop_counters (
  name text primary key,
  value integer not null
);

insert into shop_counters (name, value)
values ('order_seq', 1100)
on conflict (name) do nothing;
