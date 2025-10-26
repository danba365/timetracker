-- TimeTracker Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL, -- HEX color format
  icon VARCHAR(50), -- emoji or icon name
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  duration INTEGER, -- in minutes (30 or 60)
  priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) CHECK (status IN ('todo', 'in_progress', 'done')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  tags TEXT[], -- array of strings
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type VARCHAR(20), -- 'daily', 'weekly', 'custom'
  recurrence_days INTEGER[], -- array of day numbers (0=Sun, 6=Sat)
  recurrence_end_date DATE,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);

-- Disable RLS (Row Level Security) for public access as per requirements
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Optional: Insert default categories
INSERT INTO categories (name, color, icon) VALUES
  ('Personal', '#3B82F6', '👤'),
  ('Work', '#10B981', '💼'),
  ('Health', '#EF4444', '❤️'),
  ('Learning', '#8B5CF6', '📚');

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'tasks');

