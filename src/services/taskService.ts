import { supabase } from './supabase';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';
import { addDays, parseISO, format, isBefore } from 'date-fns';

export const taskService = {
  async getByDateRange(startDate: string, endDate: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(input: CreateTaskInput): Promise<Task> {
    const taskData = {
      title: input.title,
      description: input.description,
      date: input.date,
      start_time: input.start_time,
      end_time: input.end_time,
      priority: input.priority,
      status: input.status || 'todo',
      task_type: input.task_type || 'task',
      category_id: input.category_id,
      format_id: input.format_id,
      tags: input.tags || [],
      is_recurring: input.is_recurring || false,
      recurrence_type: input.recurrence_type,
      recurrence_days: input.recurrence_days,
      recurrence_end_date: input.recurrence_end_date,
      parent_task_id: input.parent_task_id,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) throw error;

    // Generate recurring task instances if needed
    if (data.is_recurring && !data.parent_task_id) {
      await this.generateRecurringInstances(data);
    }

    return data;
  },

  async update(input: UpdateTaskInput): Promise<Task> {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If parent task recurrence was updated, regenerate instances
    if (data.is_recurring && !data.parent_task_id && updates.is_recurring !== undefined) {
      await this.regenerateRecurringInstances(data);
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async generateRecurringInstances(parentTask: Task): Promise<void> {
    if (!parentTask.is_recurring || !parentTask.recurrence_type) return;

    const startDate = parseISO(parentTask.date);
    const endDate = parentTask.recurrence_end_date 
      ? parseISO(parentTask.recurrence_end_date)
      : addDays(startDate, 365); // Default to 1 year

    const instances: CreateTaskInput[] = [];
    let currentDate = addDays(startDate, 1); // Start from next day

    while (isBefore(currentDate, endDate) || format(currentDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
      let shouldCreateInstance = false;

      if (parentTask.recurrence_type === 'daily') {
        shouldCreateInstance = true;
      } else if (parentTask.recurrence_type === 'weekly' || parentTask.recurrence_type === 'custom') {
        const dayOfWeek = currentDate.getDay();
        shouldCreateInstance = parentTask.recurrence_days?.includes(dayOfWeek) || false;
      }

      if (shouldCreateInstance) {
        instances.push({
          title: parentTask.title,
          description: parentTask.description,
          date: format(currentDate, 'yyyy-MM-dd'),
          start_time: parentTask.start_time,
          end_time: parentTask.end_time,
          priority: parentTask.priority,
          status: 'todo',
          task_type: parentTask.task_type,
          category_id: parentTask.category_id,
          format_id: parentTask.format_id,
          tags: parentTask.tags,
          is_recurring: false,
          parent_task_id: parentTask.id,
        });
      }

      currentDate = addDays(currentDate, 1);
    }

    if (instances.length > 0) {
      const { error } = await supabase.from('tasks').insert(instances);
      if (error) throw error;
    }
  },

  async regenerateRecurringInstances(parentTask: Task): Promise<void> {
    // Delete existing instances
    await supabase
      .from('tasks')
      .delete()
      .eq('parent_task_id', parentTask.id);

    // Generate new instances
    await this.generateRecurringInstances(parentTask);
  },
};

