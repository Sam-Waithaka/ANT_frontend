import { assetPaths } from '../../constants/assets';
import { useProject52 } from '../../contexts/Project52Context';
import { useOpenProject52Reading } from '../../hooks/useOpenProject52Reading';
import LandingButton from './LandingButton';
import { heroCtas } from './landingContent';
import { landingContainer } from './LandingSection';

type LandingHeroProps = {
  darkMode: boolean;
};

const overlayClass = (darkMode: boolean) =>
  darkMode
    ? 'bg-[linear-gradient(90deg,rgba(8,8,8,0.90)_0%,rgba(8,8,8,0.74)_38%,rgba(8,8,8,0.28)_70%,rgba(8,8,8,0.20)_100%),linear-gradient(180deg,rgba(8,8,8,0.18),rgba(8,8,8,0.58))]'
    : 'bg-[linear-gradient(90deg,rgba(248,245,239,0.78)_0%,rgba(248,245,239,0.50)_38%,rgba(248,245,239,0.10)_72%,rgba(248,245,239,0.18)_100%),linear-gradient(180deg,rgba(248,245,239,0.02),rgba(248,245,239,0.48))]';

const LandingHero = ({ darkMode }: LandingHeroProps) => {
  const { currentWeek, readingTarget, weeks } = useProject52();
  const openProject52Reading = useOpenProject52Reading();
  const activeWeek = weeks.find((week) => week.week === currentWeek);
  const highlightedDay = activeWeek?.items[readingTarget.dayIndex];
  const openHighlightedNewTestamentReading = () => {
    openProject52Reading(highlightedDay?.newTestament || []);
  };

  return (
    <section className={`relative isolate overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:py-32 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
    <div className="absolute inset-0 -z-10">
      <picture>
        <source type="image/avif" srcSet={assetPaths.heroChurch.avif} sizes="100vw" />
        <source type="image/webp" srcSet={assetPaths.heroChurch.webp} sizes="100vw" />
        <img
          src={assetPaths.heroChurch.fallback}
          alt="AIC Njoro Town church building"
          className={`h-full w-full object-cover object-[68%_center] ${darkMode ? 'brightness-[0.82] contrast-[1.08] saturate-[1.05]' : 'brightness-[1.0] contrast-[1.06] saturate-[1.04]'}`}
          fetchPriority="high"
          width="1920"
          height="1276"
        />
      </picture>
      <div className={`absolute inset-0 ${overlayClass(darkMode)}`} />
      <div className={`absolute inset-0 ${darkMode ? 'bg-[radial-gradient(circle_at_78%_28%,rgba(153,27,27,0.16),transparent_25%)]' : 'bg-[radial-gradient(circle_at_78%_28%,rgba(153,27,27,0.08),transparent_25%)]'}`} />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#f8f5ef] to-transparent dark:from-[#080808]" />
    </div>

    <div className={`${landingContainer} grid min-h-[560px] items-center`}>
      <div className="max-w-5xl">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-red-800">You Are Welcome</p>
        <h1
          className={`mt-5 max-w-5xl font-serif text-5xl font-bold leading-tight sm:text-6xl lg:whitespace-nowrap lg:text-7xl ${
            darkMode ? 'text-white' : 'text-zinc-950'
          }`}
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
        >
          <span className="block">Welcome to</span>
          <span className="block">A.I.C <span className="text-red-800">Njoro Town</span></span>
        </h1>
        <div className="mt-7 h-0.5 w-16 rounded-full bg-red-700" />
        <p className={`mt-8 max-w-xl text-lg leading-8 sm:text-xl ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
          Growing together in faith, fellowship, and the Word.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {heroCtas.map((cta) => {
            const opensHighlightedReading =
              'action' in cta && cta.action === 'openHighlightedNewTestamentReading';
            const ctaHref = 'href' in cta && typeof cta.href === 'string' ? cta.href : undefined;

            return (
              <LandingButton
                key={cta.label}
                darkMode={darkMode}
                onClick={opensHighlightedReading ? openHighlightedNewTestamentReading : undefined}
                to={ctaHref}
                variant={cta.variant}
              >
                {cta.label}
              </LandingButton>
            );
          })}
        </div>
      </div>
    </div>
  </section>
  );
};

export default LandingHero;
