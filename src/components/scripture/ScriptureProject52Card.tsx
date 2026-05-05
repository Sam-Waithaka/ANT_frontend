import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type ScriptureProject52CardProps = {
  darkMode: boolean;
};

const ScriptureProject52Card = ({ darkMode }: ScriptureProject52CardProps) => (
  <section
    className={`rounded-[2rem] border p-5 shadow-sm ${
      darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25' : 'border-black/10 bg-white shadow-zinc-900/10'
    }`}
  >
    <div className="flex items-center gap-3">
      <span className={`grid size-11 place-items-center rounded-full ${darkMode ? 'bg-red-950/40 text-red-100' : 'bg-red-900/10 text-red-900'}`}>
        <CalendarDays size={20} />
      </span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Project 52</p>
        <h2 className="mt-1 text-xl font-black">Continue the journey</h2>
      </div>
    </div>
    <div className={`mt-4 grid gap-3 text-sm ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
      <div className="flex items-center gap-2">
        <CheckCircle2 size={17} className={darkMode ? 'text-red-200' : 'text-red-800'} />
        Read alongside the weekly plan
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 size={17} className={darkMode ? 'text-red-200' : 'text-red-800'} />
        Switch chapters without losing focus
      </div>
    </div>
    <Link
      to="/project52"
      className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-red-800 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 dark:focus:ring-offset-black"
    >
      Open Project 52
    </Link>
  </section>
);

export default ScriptureProject52Card;
