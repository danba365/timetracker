-- Migration: Replace duration with end_time
-- Run this in your Supabase SQL Editor

-- Add end_time column
ALTER TABLE tasks ADD COLUMN end_time TIME;

-- Optional: Migrate existing duration data to end_time
-- This calculates end_time based on start_time + duration
UPDATE tasks 
SET end_time = (start_time::time + (duration || ' minutes')::interval)::time
WHERE start_time IS NOT NULL AND duration IS NOT NULL;

-- Drop the duration column
ALTER TABLE tasks DROP COLUMN duration;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN ('start_time', 'end_time');

