import type { Task } from '../types/task';
import type { Category } from '../types/category';
import type { Format } from '../types/format';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  differenceInMinutes,
  getHours,
  getDay,
} from 'date-fns';

export interface AnalyticsMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalMinutes: number;
  currentStreak: number;
  averageTaskDuration: number;
  onTimeCompletionRate: number;
}

export interface CategoryStats {
  name: string;
  color: string;
  count: number;
  completed: number;
  completionRate: number;
  totalMinutes: number;
}

export interface FormatStats {
  format: string;
  count: number;
  completed: number;
  totalMinutes: number;
}

export interface TimeDistribution {
  hour: number;
  count: number;
}

export interface DayStats {
  day: string;
  completed: number;
  total: number;
}

export interface CompletionTrend {
  date: string;
  completed: number;
  total: number;
  rate: number;
}

export interface HeatmapData {
  date: string;
  count: number;
}

export type DateRange = 'week' | 'month' | '3months' | 'all';

/**
 * Calculate overall analytics metrics
 */
export const calculateMetrics = (
  tasks: Task[],
  dateRange: DateRange = 'month'
): AnalyticsMetrics => {
  const filteredTasks = filterTasksByDateRange(tasks, dateRange);
  const completedTasks = filteredTasks.filter((t) => t.status === 'done');

  const totalMinutes = filteredTasks.reduce((sum, task) => {
    if (!task.start_time || !task.end_time) return sum;
    const start = parseISO(`2000-01-01T${task.start_time}`);
    const end = parseISO(`2000-01-01T${task.end_time}`);
    return sum + differenceInMinutes(end, start);
  }, 0);

  const avgDuration =
    completedTasks.length > 0 ? Math.round(totalMinutes / completedTasks.length) : 0;

  return {
    totalTasks: filteredTasks.length,
    completedTasks: completedTasks.length,
    completionRate:
      filteredTasks.length > 0
        ? Math.round((completedTasks.length / filteredTasks.length) * 100)
        : 0,
    totalMinutes,
    currentStreak: calculateStreak(tasks),
    averageTaskDuration: avgDuration,
    onTimeCompletionRate: calculateOnTimeRate(completedTasks),
  };
};

/**
 * Get category statistics
 */
export const getCategoryStats = (
  tasks: Task[],
  categories: Category[],
  dateRange: DateRange = 'month'
): CategoryStats[] => {
  const filteredTasks = filterTasksByDateRange(tasks, dateRange);
  const categoryMap = new Map<string, CategoryStats>();

  filteredTasks.forEach((task) => {
    const category = categories.find((c) => c.id === task.category_id);
    const categoryName = category?.name || 'Uncategorized';
    const categoryColor = category?.color || '#94a3b8';

    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        name: categoryName,
        color: categoryColor,
        count: 0,
        completed: 0,
        completionRate: 0,
        totalMinutes: 0,
      });
    }

    const stats = categoryMap.get(categoryName)!;
    stats.count++;
    if (task.status === 'done') stats.completed++;

    if (task.start_time && task.end_time) {
      const start = parseISO(`2000-01-01T${task.start_time}`);
      const end = parseISO(`2000-01-01T${task.end_time}`);
      stats.totalMinutes += differenceInMinutes(end, start);
    }
  });

  // Calculate completion rates
  categoryMap.forEach((stats) => {
    stats.completionRate =
      stats.count > 0 ? Math.round((stats.completed / stats.count) * 100) : 0;
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
};

/**
 * Get format statistics
 */
export const getFormatStats = (
  tasks: Task[],
  formats: Format[],
  dateRange: DateRange = 'month'
): FormatStats[] => {
  const filteredTasks = filterTasksByDateRange(tasks, dateRange);
  const formatMap = new Map<string, FormatStats>();

  filteredTasks.forEach((task) => {
    const formatObj = formats.find((f) => f.id === task.format_id);
    const formatName = formatObj?.name || 'None';

    if (!formatMap.has(formatName)) {
      formatMap.set(formatName, {
        format: formatName,
        count: 0,
        completed: 0,
        totalMinutes: 0,
      });
    }

    const stats = formatMap.get(formatName)!;
    stats.count++;
    if (task.status === 'done') stats.completed++;

    if (task.start_time && task.end_time) {
      const start = parseISO(`2000-01-01T${task.start_time}`);
      const end = parseISO(`2000-01-01T${task.end_time}`);
      stats.totalMinutes += differenceInMinutes(end, start);
    }
  });

  return Array.from(formatMap.values()).sort((a, b) => b.count - a.count);
};

/**
 * Get time distribution (hourly)
 */
export const getTimeDistribution = (
  tasks: Task[],
  dateRange: DateRange = 'month'
): TimeDistribution[] => {
  const filteredTasks = filterTasksByDateRange(tasks, dateRange);
  const hourMap = new Map<number, number>();

  // Initialize all hours
  for (let i = 0; i < 24; i++) {
    hourMap.set(i, 0);
  }

  filteredTasks
    .filter((t) => t.status === 'done' && t.start_time)
    .forEach((task) => {
      const hour = getHours(parseISO(`2000-01-01T${task.start_time}`));
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

  return Array.from(hourMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour - b.hour);
};

/**
 * Get day of week statistics
 */
export const getDayStats = (tasks: Task[], dateRange: DateRange = 'month'): DayStats[] => {
  const filteredTasks = filterTasksByDateRange(tasks, dateRange);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayMap = new Map<string, { completed: number; total: number }>();

  dayNames.forEach((day) => {
    dayMap.set(day, { completed: 0, total: 0 });
  });

  filteredTasks.forEach((task) => {
    if (!task.date) return;
    const dayIndex = getDay(parseISO(task.date));
    const dayName = dayNames[dayIndex];
    const stats = dayMap.get(dayName)!;
    stats.total++;
    if (task.status === 'done') stats.completed++;
  });

  return Array.from(dayMap.entries()).map(([day, stats]) => ({
    day,
    completed: stats.completed,
    total: stats.total,
  }));
};

/**
 * Get completion trend over time
 */
export const getCompletionTrend = (
  tasks: Task[],
  dateRange: DateRange = 'month'
): CompletionTrend[] => {
  const filteredTasks = filterTasksByDateRange(tasks, dateRange);
  const now = new Date();
  let start: Date;

  switch (dateRange) {
    case 'week':
      start = startOfWeek(now, { weekStartsOn: 0 });
      break;
    case 'month':
      start = startOfMonth(now);
      break;
    case '3months':
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    default:
      start = new Date(Math.min(...filteredTasks.map((t) => parseISO(t.date).getTime())));
  }

  const days = eachDayOfInterval({ start, end: now });
  const trendMap = new Map<string, { completed: number; total: number }>();

  days.forEach((day) => {
    trendMap.set(format(day, 'yyyy-MM-dd'), { completed: 0, total: 0 });
  });

  filteredTasks.forEach((task) => {
    if (!task.date) return;
    const dateKey = task.date;
    if (trendMap.has(dateKey)) {
      const stats = trendMap.get(dateKey)!;
      stats.total++;
      if (task.status === 'done') stats.completed++;
    }
  });

  return Array.from(trendMap.entries())
    .map(([date, stats]) => ({
      date,
      completed: stats.completed,
      total: stats.total,
      rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Get heatmap data
 */
export const getHeatmapData = (tasks: Task[], dateRange: DateRange = 'month'): HeatmapData[] => {
  const filteredTasks = filterTasksByDateRange(tasks, dateRange);
  const dateMap = new Map<string, number>();

  filteredTasks
    .filter((t) => t.status === 'done')
    .forEach((task) => {
      if (!task.date) return;
      dateMap.set(task.date, (dateMap.get(task.date) || 0) + 1);
    });

  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Filter tasks by date range
 */
const filterTasksByDateRange = (tasks: Task[], dateRange: DateRange): Task[] => {
  if (dateRange === 'all') return tasks;

  const now = new Date();
  let start: Date;
  let end: Date = now;

  switch (dateRange) {
    case 'week':
      start = startOfWeek(now, { weekStartsOn: 0 });
      end = endOfWeek(now, { weekStartsOn: 0 });
      break;
    case 'month':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case '3months':
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    default:
      return tasks;
  }

  return tasks.filter((task) => {
    if (!task.date) return false;
    const taskDate = parseISO(task.date);
    return isWithinInterval(taskDate, { start, end });
  });
};

/**
 * Calculate current streak
 */
const calculateStreak = (tasks: Task[]): number => {
  const completedDates = new Set(
    tasks.filter((t) => t.status === 'done' && t.date).map((t) => t.date)
  );

  let streak = 0;
  let currentDate = new Date();

  while (true) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    if (!completedDates.has(dateStr)) break;
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

/**
 * Calculate on-time completion rate
 */
const calculateOnTimeRate = (completedTasks: Task[]): number => {
  if (completedTasks.length === 0) return 0;

  const onTime = completedTasks.filter((task) => {
    if (!task.date || !task.end_time) return true;
    // Consider it on-time if completed on the same day
    return true; // Simplified for now
  }).length;

  return Math.round((onTime / completedTasks.length) * 100);
};

/**
 * Format minutes to hours and minutes
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

