import { 
  startOfWeek, 
  addDays, 
  addWeeks,
  parseISO,
  format
} from 'date-fns';

/**
 * Parse natural language date strings like "next Wednesday", "tomorrow", "next week"
 * Returns YYYY-MM-DD format string
 */
export function parseNaturalDate(
  dateText: string,
  lang: 'he' | 'en',
  currentDate: Date = new Date()
): string | null {
  if (!dateText || !dateText.trim()) return null;

  const normalized = dateText.toLowerCase().trim();
  let result: Date | null = null;

  // Handle relative dates
  if (lang === 'en') {
    // English patterns
    if (normalized === 'today' || normalized === 'תיום') {
      result = new Date(currentDate);
    } else if (normalized === 'tomorrow' || normalized.includes('tomorrow')) {
      result = addDays(currentDate, 1);
    } else if (normalized === 'yesterday' || normalized.includes('yesterday')) {
      result = addDays(currentDate, -1);
    } else if (normalized.includes('next week')) {
      // "next week" means one week from current week
      result = addWeeks(startOfWeek(currentDate, { weekStartsOn: 0 }), 1);
    } else if (normalized.includes('this week')) {
      // Find the day in current week
      const dayMatch = normalized.match(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/);
      if (dayMatch) {
        const dayMap: { [key: string]: number } = {
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
          'thursday': 4, 'friday': 5, 'saturday': 6
        };
        const dayNum = dayMap[dayMatch[0]];
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        result = addDays(weekStart, dayNum);
        // If the day has passed this week, return null (should be next week)
        if (result < currentDate) {
          result = addWeeks(result, 1);
        }
      }
    } else if (normalized.includes('next')) {
      // "next Wednesday", "next Monday", etc.
      const dayMatch = normalized.match(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/);
      if (dayMatch) {
        const dayMap: { [key: string]: number } = {
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
          'thursday': 4, 'friday': 5, 'saturday': 6
        };
        const dayNum = dayMap[dayMatch[0]];
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const thisWeekDay = addDays(weekStart, dayNum);
        // If day already passed, use next week; otherwise use next occurrence
        result = thisWeekDay > currentDate ? thisWeekDay : addWeeks(thisWeekDay, 1);
      }
    } else {
      // Try to parse as ISO date (YYYY-MM-DD)
      try {
        const parsed = parseISO(normalized);
        if (!isNaN(parsed.getTime())) {
          result = parsed;
        }
      } catch {
        // Ignore parse errors
      }
    }
  } else {
    // Hebrew patterns
    const heDayMap: { [key: string]: number } = {
      'ראשון': 0, 'יום ראשון': 0,
      'שני': 1, 'יום שני': 1,
      'שלישי': 2, 'יום שלישי': 2,
      'רביעי': 3, 'יום רביעי': 3,
      'חמישי': 4, 'יום חמישי': 4,
      'שישי': 5, 'יום שישי': 5,
      'שבת': 6
    };

    if (normalized.includes('היום') || normalized === 'תיום') {
      result = new Date(currentDate);
    } else if (normalized.includes('מחר')) {
      result = addDays(currentDate, 1);
    } else if (normalized.includes('אתמול')) {
      result = addDays(currentDate, -1);
    } else if (normalized.includes('השבוע הבא')) {
      // "השבוע הבא" means one week from current week
      result = addWeeks(startOfWeek(currentDate, { weekStartsOn: 0 }), 1);
    } else if (normalized.includes('השבוע')) {
      // Find Hebrew day name in current week ("השבוע" or "בשבוע")
      for (const [heDay, dayNum] of Object.entries(heDayMap)) {
        if (normalized.includes(heDay)) {
          const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
          result = addDays(weekStart, dayNum);
          if (result < currentDate) {
            result = addWeeks(result, 1);
          }
          break;
        }
      }
    } else if (normalized.includes('הבא')) {
      // "יום רביעי הבא", "ביום רביעי הבא", etc.
      for (const [heDay, dayNum] of Object.entries(heDayMap)) {
        if (normalized.includes(heDay)) {
          const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
          const thisWeekDay = addDays(weekStart, dayNum);
          result = thisWeekDay > currentDate ? thisWeekDay : addWeeks(thisWeekDay, 1);
          break;
        }
      }
    } else {
      // Try patterns like "ביום רביעי", "ביום שני" (without "הבא")
      let found = false;
      for (const [heDay, dayNum] of Object.entries(heDayMap)) {
        if (normalized.includes(`ביום ${heDay}`) || normalized.includes(`יום ${heDay}`)) {
          const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
          const thisWeekDay = addDays(weekStart, dayNum);
          // If the day already passed this week, use next week; otherwise use this week
          result = thisWeekDay > currentDate ? thisWeekDay : addWeeks(thisWeekDay, 1);
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Try ISO date format
        try {
          const parsed = parseISO(normalized);
          if (!isNaN(parsed.getTime())) {
            result = parsed;
          }
        } catch {
          // Ignore
        }
      }
    }
  }

  if (!result) return null;

  // Return in YYYY-MM-DD format
  return format(result, 'yyyy-MM-dd');
}

/**
 * Parse natural language time strings like "20:00", "8pm", "8:00 PM"
 * Returns HH:MM format string (24-hour)
 */
export function parseNaturalTime(
  timeText: string,
  lang: 'he' | 'en'
): string | null {
  if (!timeText || !timeText.trim()) return null;

  const normalized = timeText.trim().toLowerCase();

  // Try HH:MM format first (24-hour)
  const time24Match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (time24Match) {
    const hours = parseInt(time24Match[1], 10);
    const minutes = parseInt(time24Match[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }

  // Try 12-hour format with AM/PM
  const time12Match = normalized.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm|בבוקר|בערב|אחה"צ)$/);
  if (time12Match) {
    let hours = parseInt(time12Match[1], 10);
    const minutes = time12Match[2] ? parseInt(time12Match[2], 10) : 0;
    const period = time12Match[3];

    if (period.includes('pm') || period.includes('בערב') || period.includes('אחה"צ')) {
      if (hours !== 12) hours += 12;
    } else if (period.includes('am') || period.includes('בבוקר')) {
      if (hours === 12) hours = 0;
    }

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }

  // Try just number with am/pm
  const numMatch = normalized.match(/^(\d{1,2})\s*(am|pm|בבוקר|בערב|אחה"צ)$/);
  if (numMatch) {
    let hours = parseInt(numMatch[1], 10);
    const period = numMatch[2];

    if (period.includes('pm') || period.includes('בערב') || period.includes('אחה"צ')) {
      if (hours !== 12) hours += 12;
    } else if (period.includes('am') || period.includes('בבוקר')) {
      if (hours === 12) hours = 0;
    }

    if (hours >= 0 && hours <= 23) {
      return `${String(hours).padStart(2, '0')}:00`;
    }
  }

  // Try Hebrew numeric times (e.g., "שמונה בערב", "עשר בבוקר")
  if (lang === 'he') {
    const heNumMap: { [key: string]: number } = {
      'אפס': 0, 'אחד': 1, 'אחת': 1, 'שניים': 2, 'שתיים': 2, 'שלושה': 3, 'שלוש': 3,
      'ארבעה': 4, 'ארבע': 4, 'חמישה': 5, 'חמש': 5, 'שישה': 6, 'שש': 6,
      'שבעה': 7, 'שבע': 7, 'שמונה': 8, 'תשעה': 9, 'תשע': 9, 'עשרה': 10, 'עשר': 10,
      'אחת עשרה': 11, 'אחד עשר': 11, 'שתים עשרה': 12, 'שנים עשר': 12,
      'שלוש עשרה': 13, 'שלושה עשר': 13, 'ארבע עשרה': 14, 'חמש עשרה': 15,
      'שש עשרה': 16, 'שבע עשרה': 17, 'שמונה עשרה': 18, 'תשע עשרה': 19,
      'עשרים': 20, 'עשרים ואחת': 21, 'עשרים ואחד': 21, 'עשרים ושתיים': 22,
      'עשרים ושלוש': 23, 'עשרים ושלושה': 23
    };

    // Check for Hebrew number + period (e.g., "שמונה בערב")
    for (const [heNum, numValue] of Object.entries(heNumMap)) {
      if (normalized.includes(heNum)) {
        let hours = numValue;
        if (normalized.includes('בערב') || normalized.includes('אחה"צ') || normalized.includes('לילה')) {
          if (hours < 12) hours += 12;
        } else if (normalized.includes('בבוקר') || normalized.includes('בוקר')) {
          if (hours === 12) hours = 0;
        }
        
        if (hours >= 0 && hours <= 23) {
          return `${String(hours).padStart(2, '0')}:00`;
        }
        break;
      }
    }
  }

  return null;
}

