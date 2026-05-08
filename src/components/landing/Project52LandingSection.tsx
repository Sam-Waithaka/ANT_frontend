import { ArrowRight, BookOpen, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingSection from './LandingSection';
import { project52Preview } from './landingContent';

type Project52LandingSectionProps = {
  darkMode: boolean;
};

const cardClass = (darkMode: boolean) =>
  `rounded-3xl border p-6 shadow-2xl sm:p-8 ${
    darkMode
      ? 'border-white/10 bg-zinc-950 shadow-black/40'
      : 'border-black/10 bg-white shadow-zinc-900/10'
  }`;

const DayIndicator = ({ label, state }: (typeof project52Preview.days)[number]) => {
  const isComplete = state === 'complete';
  const isActive = state === 'active';

  return (
    <li className="flex flex-col items-center gap-2">
      <span
        className={`inline-flex size-10 items-center justify-center rounded-full border text-xs font-black ${
          isActive
            ? 'border-red-700 bg-red-800 text-white shadow-lg shadow-red-950/20'
            : isComplete
              ? 'border-red-700/60 text-red-200'
              : 'border-white/15 text-stone-400'
        }`}
        aria-label={`${label}: ${state}`}
      >
        {isComplete ? <Check size={16} aria-hidden="true" /> : label.slice(0, 1)}
      </span>
      <span className="text-[0.68rem] font-bold uppercase text-stone-400">{label}</span>
    </li>
  );
};

const Project52LandingSection = ({ darkMode }: Project52LandingSectionProps) => (
  <LandingSection
    id="project-52"
    className={darkMode ? 'bg-[#050505]' : 'bg-[#ece7de]'}
  >
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <p className={`text-xs font-black uppercase tracking-[0.24em] ${darkMode ? 'text-red-200' : 'text-red-900'}`}>
          {project52Preview.eyebrow}
        </p>
        <h2 className={`mt-4 max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl ${darkMode ? 'text-stone-100' : 'text-zinc-950'}`}>
          {project52Preview.heading}
        </h2>
        <p className={`mt-6 max-w-xl text-base leading-7 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
          {project52Preview.description}
        </p>
        <Link
          to="/project52"
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-800 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 dark:focus:ring-offset-black"
        >
          {project52Preview.ctaLabel}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>

      <article className={cardClass(true)} aria-labelledby="project52-preview-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 id="project52-preview-title" className="text-sm font-black uppercase tracking-[0.16em] text-stone-100">
            {project52Preview.weekLabel}
          </h3>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-red-200">
            {project52Preview.progressLabel}
          </p>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Project 52 reading progress" aria-valuenow={project52Preview.progressValue} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-red-700" style={{ width: `${project52Preview.progressValue}%` }} />
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-400">
              {project52Preview.readingLabel}
            </p>
            <p className="mt-3 font-serif text-3xl text-white">{project52Preview.reading}</p>
            <p className="mt-2 text-sm leading-6 text-stone-300">{project52Preview.verseLine}</p>
          </div>
          <div className="inline-flex size-16 items-center justify-center rounded-full border border-red-400/30 bg-red-950/60 text-red-100">
            <BookOpen size={28} aria-hidden="true" />
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <ul className="grid grid-cols-5 gap-2" aria-label="Weekly reading day progress">
            {project52Preview.days.map((day) => (
              <DayIndicator key={day.label} {...day} />
            ))}
          </ul>
        </div>
      </article>
    </div>
  </LandingSection>
);

export default Project52LandingSection;
