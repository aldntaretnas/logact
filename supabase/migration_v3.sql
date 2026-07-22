-- =============================================
-- Log Activity v3 - To-Do List
-- =============================================
-- Jalankan di Supabase SQL Editor SETELAH migration_v2.sql

CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_todos_date ON todos (date DESC);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on todos" ON todos
  FOR ALL
  USING (true)
  WITH CHECK (true);
