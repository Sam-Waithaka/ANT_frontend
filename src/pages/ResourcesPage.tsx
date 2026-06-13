import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useTheme } from '../hooks/useTheme';

const ResourcesPage = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader activePath="/resources" darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl">
          <p className={`text-xs font-black uppercase tracking-[0.18em] ${darkMode ? 'text-red-100' : 'text-red-800'}`}>
            Church Resources
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">Resources</h1>
          <p className={`mt-5 max-w-2xl text-lg leading-8 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
            Articles, devotionals, Bible studies, and reflections to help our church grow in faith and in the Word.
          </p>
        </section>
      </main>

      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default ResourcesPage;
