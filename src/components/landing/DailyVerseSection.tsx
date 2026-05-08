import LandingSection from './LandingSection';
import { dailyVerse } from './landingContent';

type DailyVerseSectionProps = {
  darkMode: boolean;
};

const DailyVerseSection = ({ darkMode }: DailyVerseSectionProps) => (
  <LandingSection
    id="daily-verse"
    className={darkMode ? 'bg-[#080808]' : 'bg-[#f8f5ef]'}
  >
    <div
      className={`relative overflow-hidden rounded-3xl border p-6 shadow-2xl sm:p-8 lg:p-10 ${
        darkMode
          ? 'border-white/10 bg-zinc-950 shadow-black/40'
          : 'border-black/10 bg-[#fffaf0] shadow-zinc-900/10'
      }`}
    >
      <div
        className={`absolute inset-y-8 left-0 w-1 rounded-r-full ${
          darkMode ? 'bg-red-500/70' : 'bg-red-800'
        }`}
        aria-hidden="true"
      />
      <div className="absolute -right-16 bottom-0 hidden h-44 w-72 rounded-full bg-red-900/10 blur-3xl sm:block" />

      <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
        <div className={`text-7xl font-serif leading-none ${darkMode ? 'text-red-300/70' : 'text-red-800'}`} aria-hidden="true">
          &ldquo;
        </div>
        <div>
          <p className={`text-xs font-black uppercase tracking-[0.24em] ${darkMode ? 'text-red-200' : 'text-red-900'}`}>
            {dailyVerse.label}
          </p>
          <blockquote className={`mt-5 max-w-4xl font-serif text-2xl leading-10 sm:text-3xl ${darkMode ? 'text-stone-100' : 'text-zinc-950'}`}>
            {dailyVerse.text}
          </blockquote>
          <p className={`mt-6 text-sm font-black uppercase tracking-[0.18em] ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
            {dailyVerse.reference} <span aria-hidden="true">|</span> {dailyVerse.version}
          </p>
        </div>
      </div>
    </div>
  </LandingSection>
);

export default DailyVerseSection;
