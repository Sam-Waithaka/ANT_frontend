import GiveHero from '../components/give/GiveHero';
import GivingComingSoon from '../components/give/GivingComingSoon';
import GivingInstructionsCard from '../components/give/GivingInstructionsCard';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useTheme } from '../hooks/useTheme';

const GivePage = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader activePath="/give" darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main className="flex-1 bg-[radial-gradient(circle_at_top_left,rgba(153,27,27,0.42),transparent_34%),linear-gradient(135deg,#080808,#171717_54%,#260b0b)]">
        <GiveHero darkMode={darkMode} />
        <GivingInstructionsCard darkMode={darkMode} />
        <GivingComingSoon darkMode={darkMode} />
      </main>

      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default GivePage;
