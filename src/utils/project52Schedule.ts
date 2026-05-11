import type { ReadingTarget, ReadingWeek, Project52WeeklySchedule, Project52ReadingBlock } from '../types/project52';

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
    week: readingWeek,
    dayIndex,
    day: readingDays[dayIndex],
    isWeekendCarryover: isWeekend,
  };
};

export const formatReadingBlock = (blocks: Project52ReadingBlock[]) =>
  blocks.map(b => `${b.book} ${b.startChapter}${b.startChapter !== b.endChapter ? `-${b.endChapter}` : ''}`).join('; ');

export const buildReadingWeeks = (
  readings: Project52WeeklySchedule[],
  currentWeek: number,
): ReadingWeek[] =>
  readings.map((weeklySchedule) => {
    const week = weeklySchedule.week;
    const items = weeklySchedule.days.map((daySchedule, index) => {
      const otString = formatReadingBlock(daySchedule.oldTestament);
      const ntString = formatReadingBlock(daySchedule.newTestament);

      return {
        ...daySchedule,
        dayLabel: readingDays[index],
        dayIndex: index,
        searchable: `${otString} ${ntString}`.toLowerCase(),
      };
    });

    return {
      week,
      label: `Week ${week}`,
      isCurrent: week === currentWeek,
      items,
    };
  });
