-- Migration: AI-Powered Project Planning Layer (Simplified for immediate use)

-- ============================================
-- 1. USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  available_days INTEGER[] NOT NULL DEFAULT ARRAY[1, 2, 3, 4, 5],
  available_time_start TEXT NOT NULL DEFAULT '09:00',
  available_time_end TEXT NOT NULL DEFAULT '18:00',
  max_tasks_per_day INTEGER NOT NULL DEFAULT 3,
  preferred_task_duration INTEGER NOT NULL DEFAULT 60,
  break_between_tasks INTEGER NOT NULL DEFAULT 15,
  prefer_morning BOOLEAN NOT NULL DEFAULT false,
  prefer_evening BOOLEAN NOT NULL DEFAULT false,
  weekend_schedule BOOLEAN NOT NULL DEFAULT false,
  ai_scheduling_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_reschedule BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'custom',
  template_id UUID,
  start_date DATE NOT NULL,
  target_end_date DATE,
  tasks_per_week INTEGER NOT NULL DEFAULT 3,
  estimated_duration_per_task INTEGER NOT NULL DEFAULT 60,
  color TEXT DEFAULT '#4F46E5',
  icon TEXT,
  category_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  ai_scheduled BOOLEAN DEFAULT false,
  total_tasks INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  completion_percentage NUMERIC(5, 2) DEFAULT 0.00,
  last_scheduled_at TIMESTAMP WITH TIME ZONE,
  actual_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. PROJECT TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_order INTEGER NOT NULL DEFAULT 0,
  scheduled_date DATE,
  scheduled_start_time TIME,
  scheduled_duration INTEGER,
  depends_on_task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. PROJECT TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'custom',
  icon TEXT,
  default_tasks_per_week INTEGER DEFAULT 3,
  default_duration_per_task INTEGER DEFAULT 60,
  task_structure JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. INSERT DEFAULT TEMPLATES
-- ============================================
INSERT INTO project_templates (name, description, project_type, icon, default_tasks_per_week, default_duration_per_task, task_structure) VALUES
  (
    'Online Learning Course',
    'Structured learning program with video lessons and exercises',
    'course',
    '🎓',
    3,
    60,
    '[
      {"title": "Course Introduction", "duration": 30, "order": 1},
      {"title": "Module 1: Fundamentals", "duration": 60, "order": 2},
      {"title": "Module 2: Intermediate Concepts", "duration": 60, "order": 3},
      {"title": "Module 3: Advanced Topics", "duration": 90, "order": 4},
      {"title": "Practice Exercises", "duration": 45, "order": 5},
      {"title": "Project Assignment", "duration": 120, "order": 6},
      {"title": "Final Review & Assessment", "duration": 60, "order": 7}
    ]'::jsonb
  ),
  (
    'Fitness Training Program',
    'Progressive workout plan for strength and endurance',
    'fitness',
    '💪',
    4,
    45,
    '[
      {"title": "Warm-up & Assessment", "duration": 30, "order": 1},
      {"title": "Upper Body Strength", "duration": 45, "order": 2},
      {"title": "Lower Body Strength", "duration": 45, "order": 3},
      {"title": "Core Workout", "duration": 30, "order": 4},
      {"title": "Cardio Session", "duration": 30, "order": 5},
      {"title": "Flexibility & Stretching", "duration": 20, "order": 6},
      {"title": "Full Body Circuit", "duration": 45, "order": 7},
      {"title": "Active Recovery", "duration": 30, "order": 8},
      {"title": "HIIT Training", "duration": 25, "order": 9},
      {"title": "Progress Assessment", "duration": 30, "order": 10}
    ]'::jsonb
  ),
  (
    'Book Reading Plan',
    'Systematic approach to reading and comprehension',
    'learning',
    '📚',
    3,
    45,
    '[
      {"title": "Preview & Set Goals", "duration": 15, "order": 1},
      {"title": "Part 1: Read & Notes", "duration": 45, "order": 2},
      {"title": "Part 2: Read & Notes", "duration": 45, "order": 3},
      {"title": "Part 3: Read & Notes", "duration": 45, "order": 4},
      {"title": "Review & Summarize", "duration": 30, "order": 5},
      {"title": "Key Takeaways", "duration": 20, "order": 6}
    ]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. ENABLE RLS (Row Level Security)
-- ============================================
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE POLICIES (Allow all for now)
-- ============================================
DROP POLICY IF EXISTS "Allow all access to user_preferences" ON user_preferences;
CREATE POLICY "Allow all access to user_preferences" ON user_preferences
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to projects" ON projects;
CREATE POLICY "Allow all access to projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to project_tasks" ON project_tasks;
CREATE POLICY "Allow all access to project_tasks" ON project_tasks
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to project_templates" ON project_templates;
CREATE POLICY "Allow all access to project_templates" ON project_templates
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 8. CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_scheduled_date ON project_tasks(scheduled_date);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '📊 Tables created: user_preferences, projects, project_tasks, project_templates';
  RAISE NOTICE '🎯 3 default templates added';
END $$;

