import { LockKeyhole } from 'lucide-react';
import SiteFooter from '../../SiteFooter';
import SiteHeader from '../../SiteHeader';
import { useTheme } from '../../../hooks/useTheme';

const WritingAccessDenied = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className={`flex min-h-screen flex-col ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader darkMode={darkMode} onToggleTheme={toggleTheme} />
      <main className="grid flex-1 place-items-center px-4 py-16">
        <section className={`max-w-xl rounded-3xl border p-8 text-center shadow-xl ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`}>
          <span className={`mx-auto grid size-14 place-items-center rounded-2xl ${darkMode ? 'bg-white/10 text-red-100' : 'bg-red-950/5 text-red-800'}`}>
            <LockKeyhole size={24} />
          </span>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-red-800">Writing Studio</p>
          <h1 className="mt-3 font-serif text-4xl">Access Needed</h1>
          <p className={`mt-4 leading-7 ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
            This space is reserved for writers, editors, and publishers working on Library resources.
          </p>
        </section>
      </main>
      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default WritingAccessDenied;
