import { CalendarDays, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProject52 } from '../../contexts/Project52Context';
import { useOpenProject52Reading } from '../../hooks/useOpenProject52Reading';
import RotatingCatchphrase from '../project52/RotatingCatchphrase';
import { formatReadingBlock } from '../../utils/project52Schedule';
import Project52ProgressBar from '../project52/Project52ProgressBar';

type ScriptureProject52CardProps = {
  darkMode: boolean;
};

const ScriptureProject52Card = ({ darkMode }: ScriptureProject52CardProps) => {
  const { currentWeek, weeks, readingTarget } = useProject52();
  const openProject52Reading = useOpenProject52Reading();

  const todayItems = weeks.find((w) => w.week === currentWeek)?.items[readingTarget.dayIndex];

  const secondaryButtonClass = darkMode
    ? 'border-white/15 bg-white/10 text-stone-300 hover:bg-white/15'
    : 'border-black/10 bg-[#fffaf0] text-zinc-700 shadow-sm hover:bg-white';

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
          The plan pauses for the weekend. Catch up on the week's goals or take time to meditate on the week's readings!
        </p>
      )}

      <div className={`mt-5 flex min-h-[116px] items-center sm:min-h-[82px] ${readingTarget.isWeekendCarryover ? 'pt-5 border-t border-black/10 dark:border-white/10' : ''}`}>
        <RotatingCatchphrase darkMode={darkMode} />
      </div>

      <div className="mt-4 grid gap-3">
        {todayItems?.oldTestament && todayItems.oldTestament.length > 0 && (
          <button
            onClick={() => openProject52Reading(todayItems.oldTestament, { navigateToScripture: false })}
            className={`flex min-h-12 w-full items-center gap-2 rounded-full border px-4 py-2 text-left text-sm font-black transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${secondaryButtonClass} ${darkMode ? 'focus:ring-offset-black' : 'focus:ring-offset-white'}`}
          >
            <span className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${darkMode ? 'bg-white/10 text-stone-400' : 'bg-black/5 text-zinc-600'}`}>OT</span>
              <span>{formatReadingBlock(todayItems.oldTestament)}</span>
            </span>
          </button>
        )}

        {todayItems?.newTestament && todayItems.newTestament.length > 0 && (
          <button
            onClick={() => openProject52Reading(todayItems.newTestament, { navigateToScripture: false })}
            className={`flex min-h-12 w-full items-center gap-2 rounded-full border px-4 py-2 text-left text-sm font-black transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${secondaryButtonClass} ${darkMode ? 'focus:ring-offset-black' : 'focus:ring-offset-white'}`}
          >
            <span className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${darkMode ? 'bg-white/10 text-stone-400' : 'bg-black/5 text-zinc-600'}`}>NT</span>
              <span>{formatReadingBlock(todayItems.newTestament)}</span>
            </span>
          </button>
        )}
      </div>

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
