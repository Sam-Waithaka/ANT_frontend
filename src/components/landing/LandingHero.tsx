import { assetPaths } from '../../constants/assets';
import LandingButton from './LandingButton';
import { heroCtas } from './landingContent';
import { landingContainer } from './LandingSection';

type LandingHeroProps = {
  darkMode: boolean;
};

const overlayClass = (darkMode: boolean) =>
  darkMode
    ? 'bg-[linear-gradient(90deg,rgba(8,8,8,0.96)_0%,rgba(8,8,8,0.82)_42%,rgba(8,8,8,0.48)_74%,rgba(8,8,8,0.62)_100%),linear-gradient(180deg,rgba(8,8,8,0.42),rgba(8,8,8,0.86))]'
    : 'bg-[linear-gradient(90deg,rgba(248,245,239,0.96)_0%,rgba(248,245,239,0.82)_42%,rgba(248,245,239,0.35)_72%,rgba(248,245,239,0.58)_100%),linear-gradient(180deg,rgba(248,245,239,0.12),rgba(248,245,239,0.86))]';

const LandingHero = ({ darkMode }: LandingHeroProps) => (
  <section className={`relative isolate overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:py-32 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
    <div className="absolute inset-0 -z-10">
      <picture>
        <source type="image/avif" srcSet={assetPaths.heroChurch.avif} sizes="100vw" />
        <source type="image/webp" srcSet={assetPaths.heroChurch.webp} sizes="100vw" />
        <img
          src={assetPaths.heroChurch.fallback}
          alt="AIC Njoro Town church building"
          className="h-full w-full object-cover object-[68%_center]"
          fetchPriority="high"
          width="1920"
          height="1276"
        />
      </picture>
      <div className={`absolute inset-0 ${overlayClass(darkMode)}`} />
      <div className={`absolute inset-0 ${darkMode ? 'bg-[radial-gradient(circle_at_78%_28%,rgba(153,27,27,0.28),transparent_24%)]' : 'bg-[radial-gradient(circle_at_78%_28%,rgba(153,27,27,0.16),transparent_24%)]'}`} />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f8f5ef] to-transparent dark:from-[#080808]" />
    </div>

    <div className={`${landingContainer} grid min-h-[560px] items-center`}>
      <div className="max-w-3xl">
        <img
          src={assetPaths.circleLogo}
          alt="AIC Njoro Town"
          className={`mb-8 size-14 rounded-2xl border bg-white object-contain p-1 shadow-2xl sm:size-16 ${darkMode ? 'border-red-200/10 shadow-black/40' : 'border-red-900/10 shadow-zinc-900/10'}`}
        />
        <p className={`text-xs font-black uppercase tracking-[0.28em] ${darkMode ? 'text-red-200' : 'text-red-900'}`}>You Are Welcome</p>
        <h1 className={`mt-5 max-w-3xl text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl ${darkMode ? 'text-white' : 'text-zinc-950'}`}>
          Welcome to AIC <span className={darkMode ? 'text-red-300' : 'text-red-800'}>Njoro Town</span>
        </h1>
        <div className="mt-7 h-0.5 w-16 rounded-full bg-red-700" />
        <p className={`mt-8 max-w-xl text-lg leading-8 sm:text-xl ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
          Growing together in faith, fellowship, and the Word.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {heroCtas.map((cta) => (
            <LandingButton key={cta.label} darkMode={darkMode} to={cta.href} variant={cta.variant}>
              {cta.label}
            </LandingButton>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default LandingHero;
