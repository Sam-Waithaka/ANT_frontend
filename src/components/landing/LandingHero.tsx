import { assetPaths } from '../../constants/assets';
import LandingButton from './LandingButton';
import { heroCtas } from './landingContent';
import { landingContainer } from './LandingSection';

const LandingHero = () => (
  <section className="relative isolate overflow-hidden bg-[#080808] px-4 py-20 text-stone-100 sm:px-6 sm:py-24 lg:py-32">
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_16%,rgba(255,255,255,0.18),transparent_20%),radial-gradient(circle_at_82%_46%,rgba(153,27,27,0.28),transparent_28%),linear-gradient(120deg,#050505_0%,#080808_42%,#160909_100%)]" />
      <div className="absolute inset-y-0 right-0 w-full bg-[linear-gradient(90deg,rgba(8,8,8,0.98)_0%,rgba(8,8,8,0.72)_42%,rgba(8,8,8,0.32)_100%)]" />
      <div className="absolute right-[12%] top-20 hidden h-80 w-40 rounded-full bg-white/10 blur-3xl lg:block" />
      <div className="absolute bottom-16 right-[18%] hidden h-44 w-28 border-l border-red-700/35 lg:block" />
      <div className="absolute bottom-16 right-[14%] hidden h-28 w-44 border-t border-red-700/25 lg:block" />
    </div>

    <div className={`${landingContainer} grid min-h-[560px] items-center`}>
      <div className="max-w-3xl">
        <img
          src={assetPaths.circleLogo}
          alt="AIC Njoro Town"
          className="mb-8 size-14 rounded-2xl border border-red-200/10 bg-white object-contain p-1 shadow-2xl shadow-black/40 sm:size-16"
        />
        <p className="text-xs font-black uppercase tracking-[0.28em] text-red-200">You Are Welcome</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-tight text-white sm:text-6xl lg:text-7xl">
          Welcome to AIC <span className="text-red-300">Njoro Town</span>
        </h1>
        <div className="mt-7 h-0.5 w-16 rounded-full bg-red-700" />
        <p className="mt-8 max-w-xl text-lg leading-8 text-stone-300 sm:text-xl">
          Growing together in faith, fellowship, and the Word.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {heroCtas.map((cta) => (
            <LandingButton key={cta.label} to={cta.href} variant={cta.variant}>
              {cta.label}
            </LandingButton>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default LandingHero;
