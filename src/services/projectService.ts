import { supabase } from './supabase';
import type { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput,
  ProjectTask,
  CreateProjectTaskInput,
  UpdateProjectTaskInput,
  ProjectTemplate,
  UserPreferences,
  UpdateUserPreferencesInput
} from '../types/project';

export const projectService = {
  // ============================================
  // PROJECTS
  // ============================================
  async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getProject(id: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createProject(input: CreateProjectInput): Promise<Project> {
    const { data, error} = await supabase
      .from('projects')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProject(input: UpdateProjectInput): Promise<Project> {
    const { id, ...updateData } = input;
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================
  // PROJECT TASKS
  // ============================================
  async getProjectTasks(projectId: string): Promise<ProjectTask[]> {
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('task_order');

    if (error) throw error;
    return data || [];
  },

  async createProjectTask(input: CreateProjectTaskInput): Promise<ProjectTask> {
    const { data, error } = await supabase
      .from('project_tasks')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createProjectTasks(inputs: CreateProjectTaskInput[]): Promise<ProjectTask[]> {
    const { data, error } = await supabase
      .from('project_tasks')
      .insert(inputs)
      .select();

    if (error) throw error;
    return data || [];
  },

  async updateProjectTask(input: UpdateProjectTaskInput): Promise<ProjectTask> {
    const { id, ...updateData } = input;
    const { data, error } = await supabase
      .from('project_tasks')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProjectTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================
  // PROJECT TEMPLATES
  // ============================================
  async getAllTemplates(): Promise<ProjectTemplate[]> {
    const { data, error } = await supabase
      .from('project_templates')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getTemplate(id: string): Promise<ProjectTemplate> {
    const { data, error } = await supabase
      .from('project_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================
  // USER PREFERENCES
  // ============================================
  async getUserPreferences(): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (error) {
      // If preferences don't exist, return defaults
      if (error.code === 'PGRST116') {
        return {
          id: '00000000-0000-0000-0000-000000000001',
          available_days: [1, 2, 3, 4, 5, 6, 7],
          available_time_start: '09:00',
          available_time_end: '22:00',
          max_tasks_per_day: 3,
          preferred_task_duration: 60,
          break_between_tasks: 15,
          prefer_morning: false,
          prefer_evening: false,
          weekend_schedule: true,
          ai_scheduling_enabled: true,
          auto_reschedule: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      throw error;
    }
    return data;
  },

  async updateUserPreferences(input: UpdateUserPreferencesInput): Promise<UserPreferences> {
    const { id, ...updateData } = input;
    
    // Use upsert to handle both create and update
    const preferenceData = {
      id: id === 'new' ? '00000000-0000-0000-0000-000000000001' : id,
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(preferenceData, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

