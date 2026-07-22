-- =============================================
-- Log Activity v2 - Timer & Journal
-- =============================================
-- Jalankan script ini di Supabase SQL Editor
-- SETELAH migration.sql sudah dijalankan sebelumnya

-- Tambah kolom timer di tabel activities
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_running BOOLEAN DEFAULT false;

-- Buat tabel journals (satu entry per hari)
CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  content TEXT,
  plan_tomorrow TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index untuk query journal by date
CREATE INDEX IF NOT EXISTS idx_journals_date ON journals (date DESC);

-- Trigger auto-update updated_at untuk journals
DROP TRIGGER IF EXISTS trigger_update_journals_updated_at ON journals;
CREATE TRIGGER trigger_update_journals_updated_at
  BEFORE UPDATE ON journals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS untuk journals (sama seperti activities — personal use)
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on journals" ON journals
  FOR ALL
  USING (true)
  WITH CHECK (true);
