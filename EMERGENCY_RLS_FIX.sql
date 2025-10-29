-- EMERGENCY: Enable Row Level Security (RLS)
-- Run this in Supabase SQL Editor IMMEDIATELY!

-- 1. Enable RLS on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- 2. Create temporary "ALLOW ALL" policies
-- (We'll add proper user isolation when we implement auth)

-- Tasks
DROP POLICY IF EXISTS "Allow all access to tasks" ON public.tasks;
CREATE POLICY "Allow all access to tasks" ON public.tasks
  FOR ALL USING (true) WITH CHECK (true);

-- Categories
DROP POLICY IF EXISTS "Allow all access to categories" ON public.categories;
CREATE POLICY "Allow all access to categories" ON public.categories
  FOR ALL USING (true) WITH CHECK (true);

-- Formats
DROP POLICY IF EXISTS "Allow all access to formats" ON public.formats;
CREATE POLICY "Allow all access to formats" ON public.formats
  FOR ALL USING (true) WITH CHECK (true);

-- Events
DROP POLICY IF EXISTS "Allow all access to events" ON public.events;
CREATE POLICY "Allow all access to events" ON public.events
  FOR ALL USING (true) WITH CHECK (true);

-- Projects
DROP POLICY IF EXISTS "Allow all access to projects" ON public.projects;
CREATE POLICY "Allow all access to projects" ON public.projects
  FOR ALL USING (true) WITH CHECK (true);

-- Project Tasks
DROP POLICY IF EXISTS "Allow all access to project_tasks" ON public.project_tasks;
CREATE POLICY "Allow all access to project_tasks" ON public.project_tasks
  FOR ALL USING (true) WITH CHECK (true);

-- User Preferences
DROP POLICY IF EXISTS "Allow all access to user_preferences" ON public.user_preferences;
CREATE POLICY "Allow all access to user_preferences" ON public.user_preferences
  FOR ALL USING (true) WITH CHECK (true);

-- Project Templates
DROP POLICY IF EXISTS "Allow all access to project_templates" ON public.project_templates;
CREATE POLICY "Allow all access to project_templates" ON public.project_templates
  FOR ALL USING (true) WITH CHECK (true);

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ RLS ENABLED on all tables!';
  RAISE NOTICE '✅ Temporary "ALLOW ALL" policies created';
  RAISE NOTICE '⚠️  IMPORTANT: Add user authentication and proper RLS policies ASAP!';
END $$;

