export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in_progress' | 'done';
export type RecurrenceType = 'daily' | 'weekly' | 'custom';
export type TaskType = 'task' | 'reminder';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  start_time?: string; // HH:MM format
  end_time?: string; // HH:MM format
  priority: Priority;
  status: Status;
  task_type: TaskType;
  category_id?: string;
  format_id?: string;
  tags: string[];
  is_recurring: boolean;
  recurrence_type?: RecurrenceType;
  recurrence_days?: number[]; // 0=Sun, 6=Sat
  recurrence_end_date?: string;
  parent_task_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  priority: Priority;
  status: Status;
  task_type?: TaskType;
  category_id?: string | null;
  format_id?: string | null;
  tags?: string[];
  is_recurring?: boolean;
  recurrence_type?: RecurrenceType | null;
  recurrence_days?: number[] | null;
  recurrence_end_date?: string | null;
  parent_task_id?: string | null;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
}

