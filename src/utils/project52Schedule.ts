import type { ReadingTarget, ReadingWeek } from '../types/project52';

export const readingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const getReadingWeekOfYear = (date = new Date()) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const firstMonday = new Date(startOfYear);
  const daysUntilMonday = (8 - startOfYear.getDay()) % 7;
  firstMonday.setDate(startOfYear.getDate() + daysUntilMonday);

  if (date < firstMonday) {
    return 1;
  }

  const daysSinceFirstMonday = Math.floor((date.getTime() - firstMonday.getTime()) / 86400000);
  return Math.min(52, Math.max(1, Math.floor(daysSinceFirstMonday / 7) + 1));
};

export const getCurrentReadingTarget = (date = new Date()): ReadingTarget => {
  const readingWeek = getReadingWeekOfYear(date);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayIndex = isWeekend ? 4 : Math.max(0, dayOfWeek - 1);

  return {
    week: isWeekend ? Math.max(1, readingWeek - 1) : readingWeek,
    dayIndex,
    day: readingDays[dayIndex],
    isWeekendCarryover: isWeekend,
  };
};

export const splitReading = (reading: string) => {
  const [oldTestament = '', newTestament = ''] = reading.split('|').map((part) => part.trim());
  return { oldTestament, newTestament };
};

export const buildReadingWeeks = (
  readings: Record<number, string[]>,
  currentWeek: number,
): ReadingWeek[] =>
  Object.entries(readings).map(([weekKey, weekReadings]) => {
    const week = Number(weekKey);
    const items = weekReadings.map((reading, index) => {
      const parts = splitReading(reading);
      return {
        day: readingDays[index],
        dayIndex: index,
        ...parts,
        searchable: `${parts.oldTestament} ${parts.newTestament}`.toLowerCase(),
      };
    });

    return {
      week,
      label: `Week ${week}`,
      isCurrent: week === currentWeek,
      items,
    };
  });
