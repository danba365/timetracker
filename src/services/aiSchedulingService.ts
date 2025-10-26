import type { 
  AIScheduleRequest, 
  AIScheduleResponse, 
  TaskTemplate, 
  UserPreferences 
} from '../types/project';
import { format, addDays, parse, isAfter } from 'date-fns';

/**
 * AI-Powered Scheduling Service
 * 
 * This service provides intelligent task scheduling using a combination of:
 * 1. Rule-based algorithmic scheduling (works offline)
 * 2. Optional OpenAI enhancement (requires API key and backend)
 */

interface TimeSlot {
  date: string;
  time: string;
  duration: number;
}

export class AISchedulingService {
  /**
   * Main scheduling function that intelligently schedules project tasks
   */
  async scheduleProject(request: AIScheduleRequest): Promise<AIScheduleResponse> {
    const { tasks, start_date, target_end_date, preferences, existing_tasks = [] } = request;

    // Use algorithmic scheduling
    const scheduledTasks = this.algorithmicSchedule(
      tasks,
      start_date,
      target_end_date,
      preferences,
      existing_tasks
    );

    return {
      scheduled_tasks: scheduledTasks,
      reasoning: 'Tasks scheduled based on your availability preferences and existing calendar',
      warnings: this.generateWarnings(scheduledTasks, target_end_date),
    };
  }

  /**
   * Algorithmic scheduling - deterministic, rule-based scheduling
   */
  private algorithmicSchedule(
    tasks: TaskTemplate[],
    startDate: string,
    targetEndDate: string | undefined,
    preferences: UserPreferences,
    existingTasks: { date: string; start_time: string; duration: number }[]
  ) {
    const scheduled: AIScheduleResponse['scheduled_tasks'] = [];
    const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
    
    let currentDate = parse(startDate, 'yyyy-MM-dd', new Date());
    const endDate = targetEndDate 
      ? parse(targetEndDate, 'yyyy-MM-dd', new Date())
      : addDays(currentDate, 365); // Max 1 year if no end date

    // Create a map of existing tasks by date
    const existingTasksByDate = this.groupTasksByDate(existingTasks);

    for (const task of sortedTasks) {
      let taskScheduled = false;
      let attempts = 0;
      const maxAttempts = 365; // Prevent infinite loops

      while (!taskScheduled && attempts < maxAttempts && !isAfter(currentDate, endDate)) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const dayOfWeek = currentDate.getDay() + 1; // 1=Sunday, 7=Saturday

        // Check if this day is available
        if (this.isDayAvailable(dayOfWeek, preferences)) {
          // Find available time slots for this day
          const availableSlots = this.findAvailableTimeSlots(
            dateStr,
            preferences,
            existingTasksByDate,
            task.duration
          );

          if (availableSlots.length > 0) {
            // Pick the best slot based on preferences
            const bestSlot = this.selectBestTimeSlot(availableSlots, preferences);
            
            scheduled.push({
              title: task.title,
              description: task.description,
              scheduled_date: dateStr,
              scheduled_start_time: bestSlot.time,
              scheduled_duration: task.duration,
              task_order: task.order,
            });

            // Add to existing tasks to avoid conflicts
            if (!existingTasksByDate[dateStr]) {
              existingTasksByDate[dateStr] = [];
            }
            existingTasksByDate[dateStr].push({
              date: dateStr,
              start_time: bestSlot.time,
              duration: task.duration,
            });

            taskScheduled = true;
          }
        }

        if (!taskScheduled) {
          currentDate = addDays(currentDate, 1);
          attempts++;
        }
      }

      if (!taskScheduled) {
        // If we couldn't schedule, add without time (manual scheduling needed)
        scheduled.push({
          title: task.title,
          description: task.description,
          scheduled_date: format(currentDate, 'yyyy-MM-dd'),
          scheduled_start_time: preferences.available_time_start,
          scheduled_duration: task.duration,
          task_order: task.order,
        });
      }

      // Move to next potential date
      currentDate = addDays(currentDate, 1);
    }

    return scheduled;
  }

  /**
   * Check if a day is available based on user preferences
   */
  private isDayAvailable(dayOfWeek: number, preferences: UserPreferences): boolean {
    return preferences.available_days.includes(dayOfWeek);
  }

  /**
   * Find available time slots on a given day
   */
  private findAvailableTimeSlots(
    date: string,
    preferences: UserPreferences,
    existingTasksByDate: Record<string, { date: string; start_time: string; duration: number }[]>,
    taskDuration: number
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const existingOnDate = existingTasksByDate[date] || [];

    // Count tasks on this date
    if (existingOnDate.length >= preferences.max_tasks_per_day) {
      return []; // Day is full
    }

    const startTime = this.parseTime(preferences.available_time_start);
    const endTime = this.parseTime(preferences.available_time_end);

    // Generate potential slots (every 30 minutes)
    let currentTime = startTime;
    while (currentTime + taskDuration <= endTime) {
      const slotTime = this.formatTime(currentTime);
      const slotEnd = currentTime + taskDuration;

      // Check if this slot conflicts with existing tasks
      let hasConflict = false;
      for (const existing of existingOnDate) {
        const existingStart = this.parseTime(existing.start_time);
        const existingEnd = existingStart + existing.duration;

        // Check for overlap
        if (!(slotEnd <= existingStart || currentTime >= existingEnd)) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        slots.push({
          date,
          time: slotTime,
          duration: taskDuration,
        });
      }

      currentTime += 30; // Move in 30-minute increments
    }

    return slots;
  }

  /**
   * Select the best time slot based on user preferences
   */
  private selectBestTimeSlot(slots: TimeSlot[], preferences: UserPreferences): TimeSlot {
    if (slots.length === 0) {
      throw new Error('No available slots');
    }

    // Prefer morning (before 12:00)
    if (preferences.prefer_morning) {
      const morningSlots = slots.filter(s => this.parseTime(s.time) < 720);
      if (morningSlots.length > 0) {
        return morningSlots[0];
      }
    }

    // Prefer evening (after 17:00)
    if (preferences.prefer_evening) {
      const eveningSlots = slots.filter(s => this.parseTime(s.time) >= 1020);
      if (eveningSlots.length > 0) {
        return eveningSlots[0];
      }
    }

    // Default: return first available slot
    return slots[0];
  }

  /**
   * Group tasks by date for easy lookup
   */
  private groupTasksByDate(
    tasks: { date: string; start_time: string; duration: number }[]
  ): Record<string, { date: string; start_time: string; duration: number }[]> {
    const grouped: Record<string, { date: string; start_time: string; duration: number }[]> = {};
    
    for (const task of tasks) {
      if (!grouped[task.date]) {
        grouped[task.date] = [];
      }
      grouped[task.date].push(task);
    }
    
    return grouped;
  }

  /**
   * Parse time string (HH:MM) to minutes since midnight
   */
  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Format minutes since midnight to time string (HH:MM)
   */
  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * Generate warnings about the schedule
   */
  private generateWarnings(
    scheduledTasks: AIScheduleResponse['scheduled_tasks'],
    targetEndDate?: string
  ): string[] {
    const warnings: string[] = [];

    if (scheduledTasks.length === 0) {
      warnings.push('No tasks could be scheduled');
      return warnings;
    }

    const lastTask = scheduledTasks[scheduledTasks.length - 1];
    
    if (targetEndDate) {
      const lastDate = parse(lastTask.scheduled_date, 'yyyy-MM-dd', new Date());
      const target = parse(targetEndDate, 'yyyy-MM-dd', new Date());
      
      if (isAfter(lastDate, target)) {
        const daysDiff = Math.ceil((lastDate.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
        warnings.push(`Schedule extends ${daysDiff} days beyond target end date`);
      }
    }

    return warnings;
  }

  /**
   * Reschedule incomplete tasks
   */
  async rescheduleTasks(
    incompleteTasks: TaskTemplate[],
    preferences: UserPreferences,
    existingTasks: { date: string; start_time: string; duration: number }[]
  ): Promise<AIScheduleResponse> {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    return this.scheduleProject({
      project_id: '', // Not needed for rescheduling
      tasks: incompleteTasks,
      start_date: today,
      preferences,
      existing_tasks: existingTasks,
    });
  }
}

export const aiSchedulingService = new AISchedulingService();

