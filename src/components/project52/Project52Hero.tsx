import { useEffect, useState } from 'react';
import { CalendarDays, Download, Sparkles } from 'lucide-react';

type Catchphrase = {
  label: string;
  scripture?: string;
};

const catchphrases: Catchphrase[] = [
  { label: 'One Year. One Word.' },
  { label: 'Let The Text Speak' },
  { label: 'A Year In Scripture' },
  { label: 'Read. Reflect. Renew.' },
  { label: 'Journey Through The Word' },
  { label: 'Week By Week In Grace' },
  { label: 'Rooted In The Word' },
  { label: 'Open The Scriptures' },
  { label: 'Grace In Every Chapter.' },
  { label: 'Walk With The Word' },
  { label: 'Truth For Every Season' },
  { label: 'Read Together. Grow Together.' },
  { label: 'Fifty-Two Weeks Of Faith' },
  { label: 'Scripture For The Journey.' },
  { label: 'Begin With The Word' },
  { label: 'The Word, Every Week' },
  { label: 'Growing Through Scripture' },
  { label: 'One Church. One Journey.' },
  { label: 'Hear. Read. Live.' },
  { label: 'Come To The Word' },
  { label: 'Build On The Word' },
  { label: 'Unshaken Truth' },
  { label: 'One Body. One Word.' },
  { label: 'Together In Truth' },
  { label: 'Anchored In Truth' },
  { label: 'Faith Comes By Hearing' },
  { label: 'Scripture In Season' },
  { label: 'The Word Endures' },
  { label: 'Truth That Transforms' },
  { label: 'Step Into Scripture' },
  { label: 'Word Alive, Faith Alive' },
  { label: 'Genesis To Revelation' },
  { label: 'Start. Stay. Finish.' },
  { label: 'You Read. You Grow.' },
  { label: 'Through The Bible. Through The Year.' },
  { label: 'Read It. Live It. Every Day.' },
  { label: 'Still Reading. Still Believing.' },
  { label: 'Same Word. New Wonder.' },
  { label: 'Open. Read. Obey.' },
  { label: 'Hide It In Your Heart', scripture: 'Psalm 119:11' },
  { label: 'A Lamp To My Feet', scripture: 'Psalm 119:105' },
  { label: 'The Word Became Flesh', scripture: 'John 1:14' },
  { label: 'Open My Eyes', scripture: 'Psalm 119:18' },
  { label: 'Teach Me, O Lord', scripture: 'Psalm 119:33' },
  { label: 'Sweeter Than Honey', scripture: 'Psalm 119:103' },
  { label: 'More To Be Desired Than Gold', scripture: 'Psalm 19:10' },
  { label: 'Built On The Rock', scripture: 'Matthew 7:24' },
  { label: 'Study To Show Yourself Approved', scripture: '2 Timothy 2:15' },
  { label: 'Not By Bread Alone', scripture: 'Deuteronomy 8:3' },
];

type Project52HeroProps = {
  darkMode: boolean;
  status: string;
  onJumpToCurrentWeek: () => void;
  onDownloadPdf: () => void;
};

const RotatingCatchphrase = ({ darkMode }: { darkMode: boolean }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePhrase = catchphrases[activeIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % catchphrases.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className={`mb-6 inline-flex min-h-9 max-w-full items-center gap-2 overflow-hidden rounded-full border px-3 py-2 text-xs font-bold tracking-[0.14em] ${
        darkMode ? 'border-red-300/20 bg-red-950/30 text-red-100' : 'border-red-900/15 bg-white/70 text-red-950'
      }`}
    >
      <Sparkles size={14} className="shrink-0" />
      <span key={activePhrase.label} className="project52-catchphrase inline-flex min-w-0 items-center gap-2">
        <span className="truncate uppercase">{activePhrase.label}</span>
        {activePhrase.scripture && (
          <span className={`hidden shrink-0 normal-case tracking-normal sm:inline ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
            {activePhrase.scripture}
          </span>
        )}
      </span>
    </div>
  );
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
