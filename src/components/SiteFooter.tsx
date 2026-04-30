import { assetPaths } from '../constants/assets';

type SiteFooterProps = {
  darkMode: boolean;
};

const SiteFooter = ({ darkMode }: SiteFooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`border-t px-4 py-8 text-sm sm:px-6 ${
        darkMode ? 'border-white/10 text-stone-400' : 'border-black/10 text-zinc-600'
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
        <div>
          <p>© 2020 - {currentYear} A.N.T Media Crew. All rights reserved.</p>
        </div>
        <a
          href="https://media-crew.aicnjorotown.org"
          className={`inline-flex items-center rounded-2xl border px-4 py-3 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${
            darkMode
              ? 'border-white/10 bg-white text-zinc-950 focus:ring-offset-black'
              : 'border-black/10 bg-white/80 shadow-sm focus:ring-offset-[#f8f5ef]'
          }`}
          aria-label="Visit AIC Njoro Town Media Crew"
        >
          <img
            src={assetPaths.mediaCrewLogoBlack}
            alt="AIC Njoro Town Media Crew"
            className="h-10 w-auto object-contain"
          />
        </a>
      </div>
    </footer>
  );
};

export default SiteFooter;
