import { ChevronRight, Search } from 'lucide-react';
import type { RefObject } from 'react';
import { Link } from 'react-router-dom';
import type { ReadingTarget, ReadingWeek, TestamentFilter } from '../../types/project52';
import { buildScriptureHref } from '../../utils/scriptureReference';
import { formatReadingBlock } from '../../utils/project52Schedule';

type ReadingPlanSectionProps = {
  activeFilter: TestamentFilter;
  activeWeek: number;
  currentWeekRef: RefObject<HTMLElement | null>;
  darkMode: boolean;
  filteredWeeks: ReadingWeek[];
  readingTarget: ReadingTarget;
  searchTerm: string;
  onChangeFilter: (filter: TestamentFilter) => void;
  onSearchChange: (value: string) => void;
  onToggleWeek: (week: number) => void;
};

const filters: Array<[TestamentFilter, string]> = [
  ['both', 'Both'],
  ['old', 'Old Testament'],
  ['new', 'New Testament'],
];

const ReadingPlanSection = ({
  activeFilter,
  activeWeek,
  currentWeekRef,
  darkMode,
  filteredWeeks,
  readingTarget,
  searchTerm,
  onChangeFilter,
  onSearchChange,
  onToggleWeek,
}: ReadingPlanSectionProps) => (
  <section className="px-4 py-8 sm:px-6 sm:py-12" aria-labelledby="reading-plan-heading">
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`text-sm font-bold uppercase tracking-[0.16em] ${darkMode ? 'text-red-200' : 'text-red-900'}`}>
            Bible reading plan
          </p>
          <h2 id="reading-plan-heading" className="mt-2 text-3xl font-black sm:text-4xl">Weekly readings</h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
            Scroll inside the plan to browse all 52 weeks.
          </p>
        </div>
        <div className={`relative rounded-full border ${darkMode ? 'border-white/10 bg-white/10' : 'border-black/10 bg-white shadow-sm'}`}>
          <Search className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`} size={18} />
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by book"
            className={`h-12 w-full rounded-full bg-transparent pl-11 pr-4 text-base outline-none placeholder:text-sm sm:w-72 ${darkMode ? 'text-white placeholder:text-stone-500' : 'text-zinc-950 placeholder:text-zinc-500'}`}
            type="search"
          />
        </div>
      </div>

      <div
        className={`sticky top-[73px] z-20 mb-6 grid grid-cols-3 gap-1 rounded-full border p-1 shadow-sm backdrop-blur-xl ${darkMode ? 'border-white/10 bg-black/75' : 'border-black/10 bg-[#f8f5ef]/90'}`}
        role="tablist"
        aria-label="Filter readings by testament"
      >
        {filters.map(([value, label]) => (
          <button
            key={value}
            onClick={() => onChangeFilter(value)}
            className={`min-h-11 rounded-full px-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-red-700 ${activeFilter === value ? 'bg-red-800 text-white shadow-md shadow-red-950/20' : darkMode ? 'text-stone-300 hover:bg-white/10' : 'text-zinc-700 hover:bg-white'}`}
            role="tab"
            aria-selected={activeFilter === value}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`max-h-[72vh] overflow-y-auto rounded-[2rem] border p-2 pr-1 shadow-inner sm:max-h-[680px] sm:p-3 ${darkMode ? 'border-white/10 bg-black/20' : 'border-black/10 bg-white/45'}`}>
        <div className="grid gap-4 pr-1">
          {filteredWeeks.length === 0 ? (
            <div className={`rounded-3xl border p-8 text-center ${darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-black/10 bg-white text-zinc-600'}`}>
              No readings match that search. Try a book name like John, Psalms, or Romans.
            </div>
          ) : (
            filteredWeeks.map((week) => {
              const isActive = activeWeek === week.week;

              return (
                <article
                  key={week.week}
                  ref={week.isCurrent ? currentWeekRef : null}
                  tabIndex={week.isCurrent ? -1 : undefined}
                  className={`scroll-mt-32 rounded-[1.75rem] border p-4 shadow-sm transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-700 sm:p-5 ${week.isCurrent ? darkMode ? 'border-red-300/45 bg-red-950/25 shadow-red-950/20' : 'border-red-800/30 bg-red-50 shadow-red-950/10' : darkMode ? 'border-white/10 bg-white/[0.055] hover:bg-white/[0.075]' : 'border-black/10 bg-white hover:shadow-lg'}`}
                >
                  <button
                    onClick={() => onToggleWeek(isActive ? 0 : week.week)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                    aria-expanded={isActive}
                  >
                    <span>
                      <span className={`text-xs font-black uppercase tracking-[0.16em] ${week.isCurrent ? darkMode ? 'text-red-200' : 'text-red-700' : darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>
                        {week.isCurrent ? 'Current week' : 'Reading week'}
                      </span>
                      <span className="mt-1 block text-2xl font-black">{week.label}</span>
                    </span>
                    <ChevronRight className={`shrink-0 transition ${isActive ? 'rotate-90' : ''}`} size={22} />
                  </button>

                  {isActive && (
                    <div className="mt-5 grid gap-3">
                      {week.items.map((item) => {
                        const isCurrentReading = week.isCurrent && item.dayIndex === readingTarget.dayIndex;

                        return (
                          <div key={`${week.week}-${item.day}`} className={`grid gap-3 rounded-3xl sm:grid-cols-2 ${isCurrentReading ? 'ring-2 ring-red-700/70 ring-offset-2 ring-offset-transparent' : ''}`}>
                            {(activeFilter === 'both' || activeFilter === 'old') && item.oldTestament.length > 0 && (
                              <Link to={buildScriptureHref(formatReadingBlock(item.oldTestament))} className={`block rounded-2xl border p-4 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 ${isCurrentReading ? darkMode ? 'border-red-200/60 bg-red-950/45 shadow-lg shadow-red-950/25' : 'border-red-800/35 bg-white shadow-lg shadow-red-950/10' : darkMode ? 'border-red-300/20 bg-black/30' : 'border-red-900/15 bg-[#fffaf4]'}`}>
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${isCurrentReading ? 'bg-red-800 text-white' : darkMode ? 'bg-red-300/10 text-red-100' : 'bg-red-900/10 text-red-950'}`}>OT / {item.dayLabel}</span>
                                <p className="mt-3 text-lg font-extrabold leading-snug">{formatReadingBlock(item.oldTestament)}</p>
                              </Link>
                            )}
                            {(activeFilter === 'both' || activeFilter === 'new') && item.newTestament.length > 0 && (
                              <Link to={buildScriptureHref(formatReadingBlock(item.newTestament))} className={`block rounded-2xl border p-4 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 ${isCurrentReading ? darkMode ? 'border-red-200/60 bg-white/15 shadow-lg shadow-red-950/25' : 'border-red-800/35 bg-zinc-950 text-white shadow-lg shadow-red-950/10' : darkMode ? 'border-white/15 bg-white/10' : 'border-zinc-900/10 bg-zinc-50'}`}>
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${isCurrentReading ? darkMode ? 'bg-red-800 text-white' : 'bg-white text-red-900' : darkMode ? 'bg-white/10 text-stone-100' : 'bg-zinc-950 text-white'}`}>NT / {item.dayLabel}</span>
                                <p className="mt-3 text-lg font-extrabold leading-snug">{formatReadingBlock(item.newTestament)}</p>
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  </section>
);

export default ReadingPlanSection;
