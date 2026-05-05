export type TestamentFilter = 'both' | 'old' | 'new';

export type Project52ReadingBlock = {
  book: string;
  startChapter: number;
  endChapter: number;
};

export type Project52DailySchedule = {
  day: number;
  oldTestament: Project52ReadingBlock[];
  newTestament: Project52ReadingBlock[];
};

export type Project52WeeklySchedule = {
  week: number;
  days: Project52DailySchedule[];
};

export type ReadingItem = Project52DailySchedule & {
  dayLabel: string;
  dayIndex: number;
  searchable: string;
};

export type ReadingWeek = {
  week: number;
  label: string;
  isCurrent: boolean;
  items: ReadingItem[];
};

export type ReadingTarget = {
  week: number;
  dayIndex: number;
  day: string;
  isWeekendCarryover: boolean;
};

export type Catchphrase = {
  label: string;
  scripture?: string;
};
