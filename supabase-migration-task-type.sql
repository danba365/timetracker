-- Migration: Add Task Type Support (Tasks vs Reminders)
-- ============================================
-- This allows distinguishing between actionable tasks and informational reminders
-- Run this in your Supabase SQL Editor

-- 1. Add task_type column to tasks table
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'task';

-- 2. Add check constraint for valid values
ALTER TABLE tasks 
  ADD CONSTRAINT task_type_check 
  CHECK (task_type IN ('task', 'reminder'));

-- 3. Update existing tasks to be 'task' type (if not already set)
UPDATE tasks 
  SET task_type = 'task' 
  WHERE task_type IS NULL;

-- 4. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(task_type);

-- SUCCESS MESSAGE
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '📊 Added task_type column to tasks table';
  RAISE NOTICE '🎯 Supported types: task, reminder';
END $$;

