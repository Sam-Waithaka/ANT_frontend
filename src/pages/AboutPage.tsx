import AboutIntro from '../components/about/AboutIntro';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useTheme } from '../hooks/useTheme';

const AboutPage = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen overflow-x-clip transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader activePath="/about" darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main>
        <AboutIntro darkMode={darkMode} />
      </main>

      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default AboutPage;
