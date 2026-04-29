import { CalendarDays, Download } from 'lucide-react';
import RotatingCatchphrase from './RotatingCatchphrase';

type Project52HeroProps = {
  darkMode: boolean;
  status: string;
  onJumpToCurrentWeek: () => void;
  onDownloadPdf: () => void;
};

const Project52Hero = ({ darkMode, status, onJumpToCurrentWeek, onDownloadPdf }: Project52HeroProps) => (
  <div className="pt-4 sm:pt-8">
    <RotatingCatchphrase darkMode={darkMode} />
    <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-normal sm:text-6xl lg:text-7xl">Project 52</h1>
    <p className={`mt-5 max-w-2xl text-lg leading-8 sm:text-xl ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
      Read through the Bible week by week with our church community across 52 intentional weeks.
    </p>
    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
      <button
        onClick={onJumpToCurrentWeek}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-800 px-6 py-3 font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
      >
        <CalendarDays size={19} />
        Today / Current Week
      </button>
      <button
        onClick={onDownloadPdf}
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-6 py-3 font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${
          darkMode
            ? 'border-white/15 bg-white/10 text-white hover:bg-white/15 focus:ring-offset-black'
            : 'border-black/10 bg-white text-zinc-950 shadow-sm hover:bg-zinc-50 focus:ring-offset-[#f8f5ef]'
        }`}
      >
        <Download size={19} />
        Download Plan
      </button>
    </div>
    {status && (
      <p
        className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${
          darkMode
            ? 'border-emerald-300/20 bg-emerald-950/30 text-emerald-100'
            : 'border-emerald-700/20 bg-emerald-50 text-emerald-900'
        }`}
        role="status"
      >
        {status}
      </p>
    )}
  </div>
);

export default Project52Hero;
