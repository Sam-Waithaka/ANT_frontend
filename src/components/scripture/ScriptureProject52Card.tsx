import { CalendarDays, ArrowRight } from 'lucide-react';
import type { BibleBook } from '../../types/scripture';
import type { Project52ReadingBlock } from '../../types/project52';
import { useProject52 } from '../../contexts/Project52Context';
import RotatingCatchphrase from '../project52/RotatingCatchphrase';
import { formatReadingBlock } from '../../utils/project52Schedule';
import Project52ProgressBar from '../project52/Project52ProgressBar';

type ScriptureProject52CardProps = {
  darkMode: boolean;
  books: BibleBook[];
  onBookChange: (id: string) => void;
  onChapterChange: (id: string) => void;
};

const ScriptureProject52Card = ({ darkMode, books, onBookChange, onChapterChange }: ScriptureProject52CardProps) => {
  const { currentWeek, weeks, readingTarget } = useProject52();

  const todayItems = weeks.find((w) => w.week === currentWeek)?.items[readingTarget.dayIndex];

  const navigateToReading = (blocks: Project52ReadingBlock[]) => {
    if (!blocks || blocks.length === 0) return;
    const block = blocks[0];
    const match = books.find(b => b.name === block.book);
    if (!match) return;

    onBookChange(match.id);
    onChapterChange(String(block.startChapter));
  };

  const secondaryButtonClass = darkMode
    ? 'border-white/15 bg-white/10 text-stone-100 shadow-black/25 hover:bg-white/15'
    : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/10 hover:bg-[#fffaf0]';

  return (
    <section
      className={`rounded-[2rem] border p-5 shadow-sm ${darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25' : 'border-black/10 bg-white shadow-zinc-900/10'
        }`}
    >
      <div className="flex items-center gap-3">
        <span className={`grid size-11 place-items-center rounded-full shrink-0 ${darkMode ? 'bg-red-950/40 text-red-100' : 'bg-red-900/10 text-red-900'}`}>
          <CalendarDays size={20} />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Project 52</p>
          <h2 className="mt-1 text-xl font-black">
            {readingTarget.isWeekendCarryover ? "Friday's Catch-Up" : `${readingTarget.day}'s Reading`}
          </h2>
        </div>
      </div>

      <Project52ProgressBar currentWeek={currentWeek} darkMode={darkMode} className="mt-5" />

      {readingTarget.isWeekendCarryover && (
        <p className={`mt-5 text-sm font-medium ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
          The plan pauses for the weekend. Catch up on the week's goals or take time to meditate on Friday's readings!
        </p>
      )}

      <div className={`mt-5 ${readingTarget.isWeekendCarryover ? 'pt-5 border-t border-red-900/10 dark:border-white/10' : ''}`}>
        <RotatingCatchphrase darkMode={darkMode} />
      </div>

      <div className="mt-1 grid gap-3">
        {todayItems?.oldTestament && todayItems.oldTestament.length > 0 && (
          <button
            onClick={() => navigateToReading(todayItems.oldTestament)}
            className={`flex min-h-11 items-center justify-between gap-2 rounded-2xl border px-4 py-2 text-left text-sm font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${secondaryButtonClass} ${darkMode ? 'focus:ring-offset-black' : 'focus:ring-offset-white'}`}
          >
            <span className="flex items-center gap-3">
              <span className={`rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${darkMode ? 'bg-zinc-800 text-stone-300' : 'bg-zinc-100 text-zinc-600'}`}>OT</span>
              {formatReadingBlock(todayItems.oldTestament)}
            </span>
            <ArrowRight size={16} className="opacity-50" />
          </button>
        )}

        {todayItems?.newTestament && todayItems.newTestament.length > 0 && (
          <button
            onClick={() => navigateToReading(todayItems.newTestament)}
            className={`flex min-h-11 items-center justify-between gap-2 rounded-2xl border px-4 py-2 text-left text-sm font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${secondaryButtonClass} ${darkMode ? 'focus:ring-offset-black' : 'focus:ring-offset-white'}`}
          >
            <span className="flex items-center gap-3">
              <span className={`rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${darkMode ? 'bg-zinc-800 text-stone-300' : 'bg-zinc-100 text-zinc-600'}`}>NT</span>
              {formatReadingBlock(todayItems.newTestament)}
            </span>
            <ArrowRight size={16} className="opacity-50" />
          </button>
        )}
      </div>
    </section>
  );
};

export default ScriptureProject52Card;
