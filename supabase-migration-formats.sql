-- Migration: Add Formats table and format_id to tasks
-- Run this in your Supabase SQL Editor

-- Create formats table
CREATE TABLE IF NOT EXISTS formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add format_id to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS format_id UUID REFERENCES formats(id) ON DELETE SET NULL;

-- Insert default formats
INSERT INTO formats (name, icon) VALUES
  ('Online Course', '🎓'),
  ('Podcast', '🎙️'),
  ('Book', '📚'),
  ('Video', '🎥'),
  ('Article', '📰')
ON CONFLICT DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_format_id ON tasks(format_id);

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name = 'format_id';

SELECT * FROM formats;

