import { BookOpen } from 'lucide-react';

type MediaCalloutProps = {
  darkMode: boolean;
};

const MediaCallout = ({ darkMode }: MediaCalloutProps) => (
  <section className="px-4 pb-16 sm:px-6 xl:px-8">
    <div className={`grid gap-6 rounded-2xl border p-6 shadow-2xl md:grid-cols-[auto_1fr_auto] md:items-center md:p-8 ${
      darkMode ? 'border-red-300/20 bg-red-950/55 shadow-red-950/25' : 'border-black/10 bg-[#fffaf0] shadow-zinc-900/10'
    }`}>
      <div className={`grid size-16 place-items-center rounded-full border ${
        darkMode ? 'border-white/20 bg-white/10 text-white' : 'border-red-900/15 bg-red-50 text-red-900'
      }`}>
        <BookOpen size={30} />
      </div>
      <div>
        <h2 className={`text-2xl font-extrabold tracking-normal ${darkMode ? 'text-white' : 'text-zinc-950'}`}>Stay nourished by God&apos;s Word</h2>
        <p className={`mt-2 max-w-2xl text-sm leading-6 ${darkMode ? 'text-red-50/80' : 'text-zinc-700'}`}>
          Join us this Sunday for worship, fellowship, and life-giving messages from God&apos;s Word.
        </p>
      </div>
      <a href="/contact" className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-black transition hover:-translate-y-0.5 ${
        darkMode ? 'bg-white text-red-900' : 'bg-red-800 text-white shadow-lg shadow-red-950/20 hover:bg-red-700'
      }`}>
        Join us this Sunday
      </a>
    </div>
  </section>
);

export default MediaCallout;
