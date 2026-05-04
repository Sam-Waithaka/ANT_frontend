import { BookOpen, CalendarDays, Heart, HelpCircle, Home, Moon, Settings, Sun } from 'lucide-react';
import { assetPaths } from '../../constants/assets';

type ScriptureAppNavProps = {
  darkMode: boolean;
  onToggleTheme: () => void;
};

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Scripture', href: '/scripture', icon: BookOpen, active: true },
  { label: 'Project 52', href: '/project52', icon: CalendarDays },
  { label: 'Giving', href: '#', icon: Heart },
];

const ScriptureAppNav = ({ darkMode, onToggleTheme }: ScriptureAppNavProps) => (
  <aside
    className={`hidden h-screen w-48 shrink-0 border-r px-4 py-5 lg:flex lg:flex-col ${
      darkMode ? 'border-white/10 bg-[#080808] text-stone-100' : 'border-black/10 bg-[#fffaf0] text-zinc-950'
    }`}
  >
    <a href="/" className="flex items-center gap-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-700">
      <img src={assetPaths.circleLogo} alt="" className="size-10 rounded-2xl bg-white object-contain p-1 shadow-sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-black leading-tight">AIC Njoro</p>
        <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>
          Town
        </p>
      </div>
    </a>

    <nav className="mt-10 grid gap-2" aria-label="Scripture navigation">
      {navItems.map(({ active, href, icon: Icon, label }) => (
        <a
          key={label}
          href={href}
          className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
            active
              ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
              : darkMode
                ? 'text-stone-300 hover:bg-white/10'
                : 'text-zinc-700 hover:bg-white'
          }`}
        >
          <Icon size={17} />
          {label}
        </a>
      ))}
    </nav>

    <div className="mt-auto grid gap-2">
      <a className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`} href="#">
        <Settings size={17} />
        Settings
      </a>
      <button
        type="button"
        onClick={onToggleTheme}
        className={`ml-4 flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
          darkMode ? 'text-stone-300 hover:bg-white/10' : 'text-zinc-700 hover:bg-white'
        }`}
      >
        {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        {darkMode ? 'Light theme' : 'Dark theme'}
      </button>
      <a className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`} href="#">
        <HelpCircle size={17} />
        Help
      </a>
    </div>
  </aside>
);

export default ScriptureAppNav;
