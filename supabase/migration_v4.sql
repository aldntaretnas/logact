-- =============================================
-- Log Activity v4 - Todo Time Field
-- =============================================
ALTER TABLE todos ADD COLUMN IF NOT EXISTS time TIME;
