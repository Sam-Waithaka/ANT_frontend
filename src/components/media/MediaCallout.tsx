import SiteButton from '../ui/SiteButton';
import { assetPaths } from '../../constants/assets';

type MediaCalloutProps = {
  darkMode: boolean;
};

const MediaCallout = ({ darkMode }: MediaCalloutProps) => (
  <section className="px-4 pb-16 sm:px-6 xl:px-8">
    <div className={`grid justify-items-center gap-6 rounded-2xl border p-6 text-center shadow-2xl md:grid-cols-[auto_1fr_auto] md:items-center md:justify-items-start md:p-8 md:text-left ${
      darkMode ? 'border-red-300/20 bg-red-950/55 shadow-red-950/25' : 'border-black/10 bg-[#fffaf0] shadow-zinc-900/10'
    }`}>
      <div className={`grid size-16 place-items-center overflow-hidden rounded-full border p-2 ${
        darkMode ? 'border-white/20 bg-white/10' : 'border-red-900/15 bg-white'
      }`}>
        <img src={assetPaths.circleLogo} alt="A.I.C Njoro Town Church" className="size-full object-contain" />
      </div>
      <div>
        <h2 className={`text-2xl font-extrabold tracking-normal ${darkMode ? 'text-white' : 'text-zinc-950'}`}>Stay nourished by God&apos;s Word</h2>
        <p className={`mx-auto mt-2 max-w-2xl text-sm leading-6 md:mx-0 ${darkMode ? 'text-red-50/80' : 'text-zinc-700'}`}>
          Join us this Sunday for worship, fellowship, and life-giving messages from God&apos;s Word.
        </p>
      </div>
      <SiteButton darkMode={darkMode} to="/contact">
        Join us this Sunday
      </SiteButton>
    </div>
  </section>
);

export default MediaCallout;
