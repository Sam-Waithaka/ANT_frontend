export type TestamentFilter = 'both' | 'old' | 'new';

export type ReadingItem = {
  day: string;
  dayIndex: number;
  oldTestament: string;
  newTestament: string;
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
