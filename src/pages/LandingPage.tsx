import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { assetPaths } from '../constants/assets';
import { useTheme } from '../hooks/useTheme';

const LandingPage = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader activePath="/" darkMode={darkMode} onToggleTheme={toggleTheme} sticky={false} />

      <main className="relative grid min-h-[calc(100vh-73px)] place-items-center px-4 py-16 sm:px-6 sm:py-24">
        <div className="absolute inset-0 -z-10">
          <div className={`h-full ${darkMode ? 'bg-[radial-gradient(circle_at_22%_20%,rgba(185,28,28,0.35),transparent_32%),radial-gradient(circle_at_82%_78%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(135deg,#080808,#151515_55%,#260b0b)]' : 'bg-[radial-gradient(circle_at_22%_20%,rgba(153,27,27,0.16),transparent_34%),radial-gradient(circle_at_82%_78%,rgba(0,0,0,0.08),transparent_26%),linear-gradient(135deg,#fffaf0,#f8f5ef_55%,#ece7de)]'}`} />
        </div>

        <section className="mx-auto max-w-4xl text-center">
          <img
            src={assetPaths.circleLogo}
            alt="AIC Njoro Town"
            className="mx-auto mb-8 h-14 w-14 rounded-full bg-white object-contain p-1.5 shadow-sm sm:h-16 sm:w-16"
          />
          <div className={`mx-auto mb-8 inline-flex items-center rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${darkMode ? 'border-red-300/20 bg-red-950/30 text-red-100' : 'border-red-900/15 bg-white/70 text-red-950'}`}>
            Full Website Coming soon
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-normal sm:text-7xl lg:text-8xl">AIC Njoro Town</h1>
          <p className={`mx-auto mt-8 max-w-2xl font-serif text-xl leading-8 sm:text-2xl ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
            Oh Come Let Us Worship — Psalm 95:6
          </p>
          <div className={`mx-auto mt-12 max-w-2xl rounded-3xl border p-6 text-left shadow-2xl transition hover:-translate-y-0.5 sm:p-8 ${darkMode ? 'border-white/10 bg-zinc-950/75 shadow-black/30' : 'border-black/10 bg-white/90 shadow-zinc-900/10'}`}>
            <p className={`text-xs font-black uppercase tracking-[0.18em] ${darkMode ? 'text-red-200' : 'text-red-900'}`}>Active now</p>
            <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold">Project 52</h2>
                <p className={`mt-3 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
                  Read through the Bible week by week with our church community.
                </p>
              </div>
              <Link
                to="/project52"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-red-800 px-6 py-3 font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
              >
                Open Project 52
                <ArrowRight size={19} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default LandingPage;
