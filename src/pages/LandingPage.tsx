import { ArrowRight } from 'lucide-react';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useTheme } from '../hooks/useTheme';

const LandingPage = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader darkMode={darkMode} onToggleTheme={toggleTheme} sticky={false} />

      <main className="relative grid min-h-[calc(100vh-73px)] place-items-center px-4 py-10 sm:px-6">
        <div className="absolute inset-0 -z-10">
          <div className={`h-full ${darkMode ? 'bg-[radial-gradient(circle_at_22%_20%,rgba(185,28,28,0.35),transparent_32%),radial-gradient(circle_at_82%_78%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(135deg,#080808,#151515_55%,#260b0b)]' : 'bg-[radial-gradient(circle_at_22%_20%,rgba(153,27,27,0.16),transparent_34%),radial-gradient(circle_at_82%_78%,rgba(0,0,0,0.08),transparent_26%),linear-gradient(135deg,#fffaf0,#f8f5ef_55%,#ece7de)]'}`} />
        </div>

        <section className="mx-auto max-w-4xl text-center">
          <div className={`mx-auto mb-7 inline-flex items-center rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${darkMode ? 'border-red-300/20 bg-red-950/30 text-red-100' : 'border-red-900/15 bg-white/70 text-red-950'}`}>
            Full Website Coming soon
          </div>
          <h1 className="text-5xl font-black leading-[0.95] tracking-normal sm:text-7xl lg:text-8xl">AIC Njoro Town</h1>
          <p className={`mx-auto mt-6 max-w-2xl text-lg leading-8 sm:text-xl ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
            Oh Come Let Us Worship ~Ps. 95:6
          </p>
          <div className={`mx-auto mt-8 max-w-2xl rounded-[2rem] border p-5 text-left shadow-2xl sm:p-6 ${darkMode ? 'border-white/10 bg-zinc-950/70 shadow-black/40' : 'border-white bg-white/85 shadow-zinc-900/10'}`}>
            <p className={`text-sm font-bold uppercase tracking-[0.16em] ${darkMode ? 'text-red-200' : 'text-red-900'}`}>Active now</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black">Project 52</h2>
                <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
                  Read through the Bible week by week with our church community.
                </p>
              </div>
              <a
                href="/project52"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-red-800 px-6 py-3 font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
              >
                Open Project 52
                <ArrowRight size={19} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default LandingPage;
