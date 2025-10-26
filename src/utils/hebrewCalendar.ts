import { HebrewCalendar, HDate, flags } from '@hebcal/core';

export interface HebrewHoliday {
  date: string; // YYYY-MM-DD format
  name: string;
  nameHe: string;
  isHoliday: boolean;
  category: string;
}

// Get Hebrew holidays for a given date range
export const getHebrewHolidays = (startDate: Date, endDate: Date): HebrewHoliday[] => {
  const holidays: HebrewHoliday[] = [];
  
  const options = {
    start: startDate,
    end: endDate,
    candlelighting: false,
    sedrot: false,
    omer: false,
    il: false, // Use diaspora settings
  };

  const events = HebrewCalendar.calendar(options);
  
  events.forEach((event) => {
    const date = event.getDate();
    const greg = date.greg();
    
    // Format date as YYYY-MM-DD
    const year = greg.getFullYear();
    const month = String(greg.getMonth() + 1).padStart(2, '0');
    const day = String(greg.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Determine if it's a major holiday (work-restricted)
    const mask = event.getFlags();
    const isMajorHoliday = Boolean(
      mask & flags.CHAG || 
      mask & flags.YOM_TOV_ENDS ||
      mask & flags.ROSH_CHODESH
    );
    
    holidays.push({
      date: dateStr,
      name: event.render('en'),
      nameHe: event.render('he'),
      isHoliday: isMajorHoliday,
      category: event.getCategories().join(', '),
    });
  });
  
  return holidays;
};

// Get holiday for a specific date
export const getHolidayForDate = (date: Date, holidays: HebrewHoliday[]): HebrewHoliday | undefined => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  return holidays.find(h => h.date === dateStr);
};

// Convert Gregorian date to Hebrew date string
export const getHebrewDate = (date: Date): { hebrew: string; hebrewYear: string } => {
  const hDate = new HDate(date);
  return {
    hebrew: hDate.renderGematriya(),
    hebrewYear: String(hDate.getFullYear()),
  };
};

