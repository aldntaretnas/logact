-- Migration v7: Add user_id to all tables and update RLS to per-user

-- Add user_id columns
alter table activities add column if not exists user_id uuid references auth.users(id);
alter table journals add column if not exists user_id uuid references auth.users(id);
alter table todos add column if not exists user_id uuid references auth.users(id);
alter table wishlists add column if not exists user_id uuid references auth.users(id);

-- Enable RLS on all tables (idempotent)
alter table activities enable row level security;
alter table journals enable row level security;
alter table todos enable row level security;
alter table wishlists enable row level security;

-- Drop ALL existing policies on each table
do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where tablename = 'activities' loop
    execute 'drop policy if exists "' || pol.policyname || '" on activities';
  end loop;
  for pol in select policyname from pg_policies where tablename = 'journals' loop
    execute 'drop policy if exists "' || pol.policyname || '" on journals';
  end loop;
  for pol in select policyname from pg_policies where tablename = 'todos' loop
    execute 'drop policy if exists "' || pol.policyname || '" on todos';
  end loop;
  for pol in select policyname from pg_policies where tablename = 'wishlists' loop
    execute 'drop policy if exists "' || pol.policyname || '" on wishlists';
  end loop;
end $$;

-- Create per-user RLS policies (authenticated users can only access their own data)
create policy "Users own their activities" on activities
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users own their journals" on journals
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users own their todos" on todos
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users own their wishlists" on wishlists
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
