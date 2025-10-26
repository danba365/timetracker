import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  addDays, 
  addWeeks, 
  addMonths,
  subWeeks,
  subMonths,
  isToday,
  isSameDay,
  parseISO 
} from 'date-fns';
import { he } from 'date-fns/locale';

export const formatDate = (date: Date | string, formatStr: string = 'yyyy-MM-dd', locale?: string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const options = locale === 'he' ? { locale: he } : {};
  return format(d, formatStr, options);
};

export const getWeekDays = (date: Date = new Date()): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const getWeekRange = (date: Date = new Date()): { start: Date; end: Date } => {
  return {
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 }),
  };
};

export const getMonthDays = (date: Date = new Date()): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const startWeek = startOfWeek(start, { weekStartsOn: 0 });
  const endWeek = endOfWeek(end, { weekStartsOn: 0 });
  
  const days: Date[] = [];
  let currentDate = startWeek;
  
  while (currentDate <= endWeek) {
    days.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }
  
  return days;
};

export const navigateDate = (
  date: Date,
  direction: 'prev' | 'next',
  view: 'day' | 'week' | 'month'
): Date => {
  const multiplier = direction === 'prev' ? -1 : 1;
  
  switch (view) {
    case 'day':
      return addDays(date, multiplier);
    case 'week':
      return multiplier === -1 ? subWeeks(date, 1) : addWeeks(date, 1);
    case 'month':
      return multiplier === -1 ? subMonths(date, 1) : addMonths(date, 1);
    default:
      return date;
  }
};

export const isDateToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isToday(d);
};

export const areDatesEqual = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
};

export const getTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 6; hour <= 23; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

export const formatTime = (time: string): string => {
  // Return 24-hour format without seconds (e.g., "17:00")
  // Handle both "HH:MM" and "HH:MM:SS" formats
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
};

