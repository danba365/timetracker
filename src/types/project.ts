export type ProjectType = 'course' | 'fitness' | 'learning' | 'custom';
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type ProjectTaskStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'skipped';

export interface Project {
  id: string;
  title: string;
  description?: string;
  
  // Project type and template
  project_type: ProjectType;
  template_id?: string;
  
  // Schedule settings
  start_date: string; // YYYY-MM-DD
  target_end_date?: string;
  actual_end_date?: string;
  
  // Task generation settings
  total_tasks: number;
  tasks_per_week: number;
  estimated_duration_per_task: number;
  
  // Progress tracking
  status: ProjectStatus;
  completion_percentage: number;
  tasks_completed: number;
  
  // Metadata
  color?: string;
  icon?: string;
  category_id?: string;
  
  // AI settings
  ai_scheduled: boolean;
  last_scheduled_at?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  
  // Task details
  title: string;
  description?: string;
  task_order: number;
  
  // Scheduling
  scheduled_date?: string;
  scheduled_start_time?: string;
  scheduled_duration: number;
  
  // Dependencies
  depends_on_task_id?: string;
  
  // Status
  status: ProjectTaskStatus;
  completed_at?: string;
  
  // Link to actual task
  task_id?: string;
  
  // AI metadata
  ai_suggested: boolean;
  reschedule_count: number;
  
  created_at: string;
  updated_at: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  project_type: ProjectType;
  icon?: string;
  
  // Template structure
  task_structure: TaskTemplate[];
  
  // Default settings
  default_tasks_per_week: number;
  default_duration_per_task: number;
  estimated_total_hours?: number;
  
  is_system_template: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface TaskTemplate {
  title: string;
  duration: number;
  order: number;
  description?: string;
}

export interface UserPreferences {
  id: string;
  
  // Availability settings
  available_days: number[]; // 1=Sunday, 2=Monday, etc.
  available_time_start: string; // HH:MM
  available_time_end: string; // HH:MM
  max_tasks_per_day: number;
  preferred_task_duration: number;
  
  // Scheduling preferences
  break_between_tasks: number;
  prefer_morning: boolean;
  prefer_evening: boolean;
  weekend_schedule: boolean;
  
  // AI preferences
  ai_scheduling_enabled: boolean;
  auto_reschedule: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  title: string;
  description?: string | null;
  project_type: ProjectType;
  template_id?: string | null;
  start_date: string;
  target_end_date?: string | null;
  tasks_per_week: number;
  estimated_duration_per_task: number;
  color?: string | null;
  icon?: string | null;
  category_id?: string | null;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: string;
  status?: ProjectStatus;
  ai_scheduled?: boolean;
  total_tasks?: number;
  last_scheduled_at?: string | null;
  actual_end_date?: string | null;
}

export interface CreateProjectTaskInput {
  project_id: string;
  title: string;
  description?: string | null;
  task_order: number;
  scheduled_date?: string | null;
  scheduled_start_time?: string | null;
  scheduled_duration: number;
  depends_on_task_id?: string | null;
}

export interface UpdateProjectTaskInput extends Partial<CreateProjectTaskInput> {
  id: string;
  status?: ProjectTaskStatus;
}

export interface UpdateUserPreferencesInput extends Partial<Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>> {
  id: string;
}

export interface AIScheduleRequest {
  project_id: string;
  tasks: TaskTemplate[];
  start_date: string;
  target_end_date?: string;
  preferences: UserPreferences;
  existing_tasks?: { date: string; start_time: string; duration: number }[];
}

export interface AIScheduleResponse {
  scheduled_tasks: {
    title: string;
    description?: string;
    scheduled_date: string;
    scheduled_start_time: string;
    scheduled_duration: number;
    task_order: number;
  }[];
  reasoning?: string;
  warnings?: string[];
}

