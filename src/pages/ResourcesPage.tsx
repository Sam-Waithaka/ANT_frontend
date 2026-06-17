import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import ResourcesLanding from '../components/resources/ResourcesLanding';
import { useTheme } from '../hooks/useTheme';

const ResourcesPage = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader activePath="/resources" darkMode={darkMode} onToggleTheme={toggleTheme} />

      <ResourcesLanding darkMode={darkMode} />

      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default ResourcesPage;
