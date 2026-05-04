import SiteNavigation from './SiteNavigation';
import type { SiteNavPath } from './SiteNavigation';

type SiteHeaderProps = {
  activePath?: SiteNavPath;
  darkMode: boolean;
  onToggleTheme: () => void;
  sticky?: boolean;
};

const SiteHeader = ({ activePath, darkMode, onToggleTheme, sticky = true }: SiteHeaderProps) => (
  <SiteNavigation
    activePath={activePath}
    darkMode={darkMode}
    layout="top"
    onToggleTheme={onToggleTheme}
    sticky={sticky}
  />
);

export default SiteHeader;
