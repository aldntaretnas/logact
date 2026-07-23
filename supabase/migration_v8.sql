-- Migration v8: Add work_logs table for internship logbook

create table if not exists work_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  week_number integer not null,
  activity text not null,
  result text not null,
  doc_url text,
  created_at timestamptz default now()
);

alter table work_logs enable row level security;

create policy "Users own their work_logs" on work_logs
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
