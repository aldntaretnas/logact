-- =============================================
-- Log Activity Magang - Database Setup
-- =============================================
-- Jalankan script ini di Supabase SQL Editor:
-- 1. Buka dashboard Supabase project kamu
-- 2. Klik "SQL Editor" di sidebar
-- 3. Paste seluruh script ini
-- 4. Klik "Run"

-- Buat tabel activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  project TEXT,
  duration INTEGER,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index untuk query by date (paling sering dipakai)
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities (date DESC);

-- Index untuk filter by category
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities (category);

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_updated_at ON activities;
CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Disable RLS untuk personal use (hanya 1 user)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations (personal project, no auth needed)
CREATE POLICY "Allow all operations" ON activities
  FOR ALL
  USING (true)
  WITH CHECK (true);
