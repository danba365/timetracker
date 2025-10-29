-- Check if task_type column exists and is configured correctly
-- Run this in Supabase SQL Editor

-- 1. Check if column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'tasks' 
  AND column_name = 'task_type';

-- 2. Check if constraint exists
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'task_type_check';

-- 3. Check if index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'tasks' 
  AND indexname = 'idx_tasks_type';

-- 4. Check current data (sample)
SELECT id, title, task_type 
FROM tasks 
LIMIT 5;

