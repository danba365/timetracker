-- Migration: Add AI-Powered Project Planning Layer
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Availability settings
  available_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Sunday, 2=Monday, etc.
  available_time_start TIME DEFAULT '09:00',
  available_time_end TIME DEFAULT '22:00',
  max_tasks_per_day INTEGER DEFAULT 3,
  preferred_task_duration INTEGER DEFAULT 60, -- in minutes
  
  -- Scheduling preferences
  break_between_tasks INTEGER DEFAULT 15, -- minutes
  prefer_morning BOOLEAN DEFAULT false,
  prefer_evening BOOLEAN DEFAULT false,
  weekend_schedule BOOLEAN DEFAULT true,
  
  -- AI preferences
  ai_scheduling_enabled BOOLEAN DEFAULT true,
  auto_reschedule BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default preferences
INSERT INTO user_preferences (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Project type and template
  project_type TEXT DEFAULT 'custom', -- 'course', 'fitness', 'learning', 'custom'
  template_id TEXT,
  
  -- Schedule settings
  start_date DATE NOT NULL,
  target_end_date DATE,
  actual_end_date DATE,
  
  -- Task generation settings
  total_tasks INTEGER DEFAULT 0,
  tasks_per_week INTEGER DEFAULT 3,
  estimated_duration_per_task INTEGER DEFAULT 60, -- minutes
  
  -- Progress tracking
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed', 'cancelled'
  completion_percentage INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  
  -- Metadata
  color TEXT DEFAULT '#4F46E5',
  icon TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  -- AI settings
  ai_scheduled BOOLEAN DEFAULT false,
  last_scheduled_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. PROJECT TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  task_order INTEGER NOT NULL, -- Order within the project
  
  -- Scheduling
  scheduled_date DATE,
  scheduled_start_time TIME,
  scheduled_duration INTEGER DEFAULT 60, -- minutes
  
  -- Dependencies
  depends_on_task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'scheduled', 'in_progress', 'completed', 'skipped'
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Link to actual task
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  
  -- AI metadata
  ai_suggested BOOLEAN DEFAULT false,
  reschedule_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, task_order)
);

-- ============================================
-- 4. PROJECT TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL,
  icon TEXT,
  
  -- Template structure (JSON)
  task_structure JSONB NOT NULL, -- Array of task templates
  
  -- Default settings
  default_tasks_per_week INTEGER DEFAULT 3,
  default_duration_per_task INTEGER DEFAULT 60,
  estimated_total_hours INTEGER,
  
  is_system_template BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default templates
INSERT INTO project_templates (id, name, description, project_type, icon, task_structure, default_tasks_per_week, default_duration_per_task, estimated_total_hours, is_system_template) VALUES
('00000000-0000-0000-0001-000000000001', 
 'Online Learning Course', 
 'Template for online courses with lectures, exercises, and projects',
 'course',
 '🎓',
 '[
   {"title": "Module 1: Introduction", "duration": 60, "order": 1},
   {"title": "Module 2: Core Concepts", "duration": 90, "order": 2},
   {"title": "Practice Exercise 1", "duration": 60, "order": 3},
   {"title": "Module 3: Advanced Topics", "duration": 90, "order": 4},
   {"title": "Practice Exercise 2", "duration": 60, "order": 5},
   {"title": "Final Project", "duration": 120, "order": 6},
   {"title": "Review and Assessment", "duration": 60, "order": 7}
 ]'::jsonb,
 3,
 75,
 8,
 true),
 
('00000000-0000-0000-0001-000000000002',
 'Fitness Program',
 'Template for fitness and exercise programs',
 'fitness',
 '💪',
 '[
   {"title": "Week 1: Cardio & Warm-up", "duration": 45, "order": 1},
   {"title": "Week 1: Strength Training", "duration": 60, "order": 2},
   {"title": "Week 1: Flexibility & Recovery", "duration": 30, "order": 3},
   {"title": "Week 2: Cardio Intensity", "duration": 45, "order": 4},
   {"title": "Week 2: Upper Body", "duration": 60, "order": 5},
   {"title": "Week 2: Lower Body", "duration": 60, "order": 6},
   {"title": "Week 3: HIIT Training", "duration": 45, "order": 7},
   {"title": "Week 3: Core Strength", "duration": 45, "order": 8},
   {"title": "Week 4: Full Body Workout", "duration": 60, "order": 9},
   {"title": "Week 4: Rest & Assessment", "duration": 30, "order": 10}
 ]'::jsonb,
 3,
 48,
 8,
 true),
 
('00000000-0000-0000-0001-000000000003',
 'Book Reading Plan',
 'Template for systematic book reading',
 'learning',
 '📚',
 '[
   {"title": "Chapters 1-2", "duration": 60, "order": 1},
   {"title": "Chapters 3-4", "duration": 60, "order": 2},
   {"title": "Chapters 5-6", "duration": 60, "order": 3},
   {"title": "Chapters 7-8", "duration": 60, "order": 4},
   {"title": "Chapters 9-10", "duration": 60, "order": 5},
   {"title": "Review & Notes", "duration": 45, "order": 6}
 ]'::jsonb,
 2,
 60,
 6,
 true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_scheduled_date ON project_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_project_templates_type ON project_templates(project_type);

-- ============================================
-- 6. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust based on your auth needs)
CREATE POLICY "Allow all access to user_preferences" ON user_preferences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to project_tasks" ON project_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to project_templates" ON project_templates FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 7. FUNCTIONS
-- ============================================

-- Function to update project completion percentage
CREATE OR REPLACE FUNCTION update_project_completion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET 
    completion_percentage = (
      SELECT CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(*) FILTER (WHERE status = 'completed') * 100 / COUNT(*))::INTEGER
      END
      FROM project_tasks
      WHERE project_id = NEW.project_id
    ),
    tasks_completed = (
      SELECT COUNT(*)
      FROM project_tasks
      WHERE project_id = NEW.project_id AND status = 'completed'
    ),
    updated_at = NOW()
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update project completion when tasks change
DROP TRIGGER IF EXISTS trigger_update_project_completion ON project_tasks;
CREATE TRIGGER trigger_update_project_completion
AFTER INSERT OR UPDATE OR DELETE ON project_tasks
FOR EACH ROW
EXECUTE FUNCTION update_project_completion();

