create table if not exists wishlists (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  note text,
  completed boolean default false,
  created_at timestamptz default now()
);
