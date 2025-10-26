-- Migration: Add Events table for recurring special events (birthdays, anniversaries, etc.)
-- Run this in your Supabase SQL Editor

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'birthday', 'anniversary', 'custom'
  icon TEXT,
  date TEXT NOT NULL, -- Format: DD-MM (e.g., "15-01" for 15th January)
  year INTEGER, -- Optional: original year of the event (e.g., 1990 for birthdays)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

-- Insert some example events (optional - you can delete these)
INSERT INTO events (name, event_type, icon, date, year, notes) VALUES
  ('Mom''s Birthday', 'birthday', '🎂', '15-03', 1965, 'Call her in the morning'),
  ('Wedding Anniversary', 'anniversary', '💍', '20-06', 2015, 'Celebrate 10 years!')
ON CONFLICT DO NOTHING;

