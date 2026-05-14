import ContactIntro from '../components/contact/ContactIntro';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useTheme } from '../hooks/useTheme';

const ContactPage = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen overflow-x-clip transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader activePath="/contact" darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main>
        <ContactIntro darkMode={darkMode} />
      </main>

      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default ContactPage;
