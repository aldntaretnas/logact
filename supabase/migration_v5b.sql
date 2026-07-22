alter table wishlists enable row level security;

create policy "Allow all" on wishlists for all using (true) with check (true);
