import { ArrowRight, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProject52 } from '../../contexts/Project52Context';
import { useOpenProject52Reading } from '../../hooks/useOpenProject52Reading';
import type { Project52ReadingBlock, ReadingItem } from '../../types/project52';
import { formatReadingBlock } from '../../utils/project52Schedule';
import Project52ProgressBar from '../project52/Project52ProgressBar';
import RotatingCatchphrase from '../project52/RotatingCatchphrase';

type ScriptureProject52CardProps = {
  darkMode: boolean;
  onOpenReading?: () => void;
};

type ReadingTab = 'previous' | 'today' | 'next';

const readingTabs: Array<{ key: ReadingTab; label: string; step: number }> = [
  { key: 'previous', label: 'Previous', step: -1 },
  { key: 'today', label: 'Today', step: 0 },
  { key: 'next', label: 'Next', step: 1 },
];

const shortDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const ScriptureProject52Card = ({ darkMode, onOpenReading }: ScriptureProject52CardProps) => {
  const [activeTab, setActiveTab] = useState<ReadingTab>('today');
  const { currentWeek, weeks, readingTarget } = useProject52();
  const openProject52Reading = useOpenProject52Reading();
  const activeWeek = weeks.find((week) => week.week === readingTarget.week);
  const selectedTab = readingTabs.find((tab) => tab.key === activeTab) || readingTabs[1];
  const minWeek = weeks[0]?.week || 1;
  const maxWeek = weeks[weeks.length - 1]?.week || 52;

  const getReadingForStep = (step: number) => {
    let weekNumber = readingTarget.week;
    let dayIndex = readingTarget.dayIndex + step;

    if (dayIndex < 0) {
      weekNumber = Math.max(minWeek, weekNumber - 1);
      dayIndex = 4;
    }

    if (dayIndex > 4) {
      weekNumber = Math.min(maxWeek, weekNumber + 1);
      dayIndex = 0;
    }

    if (weekNumber === minWeek && readingTarget.week === minWeek && readingTarget.dayIndex === 0 && step < 0) {
      dayIndex = 0;
    }

    if (weekNumber === maxWeek && readingTarget.week === maxWeek && readingTarget.dayIndex === 4 && step > 0) {
      dayIndex = 4;
    }

    const week = weeks.find((item) => item.week === weekNumber);
    return {
      available: !(weekNumber === readingTarget.week && dayIndex === readingTarget.dayIndex && step !== 0),
      dayIndex,
      item: week?.items[dayIndex],
      weekNumber,
    };
  };

  const tabReadings = readingTabs.reduce<Record<ReadingTab, ReturnType<typeof getReadingForStep>>>(
    (readings, tab) => ({
      ...readings,
      [tab.key]: getReadingForStep(tab.step),
    }),
    {} as Record<ReadingTab, ReturnType<typeof getReadingForStep>>,
  );
  const selectedReading = tabReadings[activeTab];
  const selectedItems = selectedReading.item;
  const selectedDayLabel = selectedItems?.dayLabel || readingTarget.day;
  const readingTitle = activeTab === 'today' ? "Today's Reading" : `${selectedTab.label} Reading`;

  const secondaryButtonClass = darkMode
    ? 'border-white/15 bg-white/10 text-stone-300 hover:bg-white/15'
    : 'border-black/10 bg-[#fffaf0] text-zinc-700 shadow-sm hover:bg-white';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';

  const openReading = (blocks: Project52ReadingBlock[]) => {
    onOpenReading?.();
    openProject52Reading(blocks, { navigateToScripture: false });
  };

  const readingButton = (label: 'OT' | 'NT', blocks: Project52ReadingBlock[], compact = false) => {
    if (blocks.length === 0) return null;

    return (
      <button
        type="button"
        onClick={() => openReading(blocks)}
        className={`flex min-h-12 w-full items-center gap-2 rounded-full border px-4 py-2 text-left text-sm font-black transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${secondaryButtonClass} ${darkMode ? 'focus:ring-offset-black' : 'focus:ring-offset-white'} ${compact ? 'min-h-10 px-3 text-xs' : ''}`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${darkMode ? 'bg-white/10 text-stone-400' : 'bg-black/5 text-zinc-600'}`}>
            {label}
          </span>
          <span className="min-w-0 truncate">{formatReadingBlock(blocks)}</span>
        </span>
      </button>
    );
  };

  const weekendDayRow = (item: ReadingItem, index: number) => (
    <div
      key={`${item.dayLabel}-${item.day}`}
      className={`rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-[#fffaf0]/55'}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">
          {shortDayLabels[index] || item.dayLabel.slice(0, 3)}
        </p>
        {item.dayIndex === readingTarget.dayIndex && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${darkMode ? 'bg-white/10 text-stone-300' : 'bg-white text-zinc-600'}`}>
            Catch up
          </span>
        )}
      </div>
      <div className="grid gap-2">
        {readingButton('OT', item.oldTestament, true)}
        {readingButton('NT', item.newTestament, true)}
      </div>
    </div>
  );

  return (
    <section
      className={`rounded-[2rem] border p-5 shadow-sm ${
        darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25' : 'border-black/10 bg-white shadow-zinc-900/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-full ${darkMode ? 'bg-red-950/40 text-red-100' : 'bg-red-900/10 text-red-900'}`}>
          <CalendarDays size={20} />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Project 52</p>
          <h2 className="mt-1 text-xl font-black">
            {readingTarget.isWeekendCarryover ? 'Weekend Catch-Up' : readingTitle}
          </h2>
          {!readingTarget.isWeekendCarryover && activeTab !== 'today' && (
            <p className={`mt-1 text-xs font-bold ${mutedTextClass}`}>Today is {readingTarget.day}</p>
          )}
        </div>
      </div>

      <Project52ProgressBar currentWeek={currentWeek} darkMode={darkMode} className="mt-5" />

      <div className="mt-5 flex min-h-[116px] items-center sm:min-h-[82px]">
        <RotatingCatchphrase darkMode={darkMode} />
      </div>

      {readingTarget.isWeekendCarryover ? (
        <div className="mt-4 border-t border-black/10 pt-5 dark:border-white/10">
          <p className={`text-sm font-medium leading-6 ${mutedTextClass}`}>
            Review this week's readings or catch up where you left off.
          </p>
          <div className="mt-4 grid max-h-80 gap-3 overflow-y-auto pr-1">
            {activeWeek?.items.map(weekendDayRow)}
          </div>
        </div>
      ) : (
        <>
          <div className={`mt-4 grid grid-cols-3 gap-1 rounded-full border p-1 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#f8f5ef]'}`}>
            {readingTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                disabled={!tabReadings[tab.key].available}
                onClick={() => setActiveTab(tab.key)}
                className={`min-h-9 rounded-full px-2 text-xs font-black transition ${
                  activeTab === tab.key
                    ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                    : darkMode
                      ? 'text-stone-300 hover:bg-white/10'
                      : 'text-zinc-600 hover:bg-white'
                } disabled:cursor-not-allowed disabled:opacity-45`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className={`mt-3 text-xs font-bold ${mutedTextClass}`}>
            {selectedDayLabel}, Week {selectedReading.weekNumber} of 52
          </p>
          <div className="mt-3 grid gap-3">
            {selectedItems ? (
              <>
                {readingButton('OT', selectedItems.oldTestament)}
                {readingButton('NT', selectedItems.newTestament)}
              </>
            ) : (
              <p className={`rounded-2xl border p-4 text-sm font-bold ${darkMode ? 'border-white/10 text-stone-400' : 'border-black/10 text-zinc-600'}`}>
                This reading is not available yet.
              </p>
            )}
          </div>
        </>
      )}

      <div className="mt-5 border-t border-black/10 pt-5 dark:border-white/10">
        <Link
          to="/project52"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-red-800 px-6 py-2 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
        >
          Open Project 52
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
};

export default ScriptureProject52Card;
