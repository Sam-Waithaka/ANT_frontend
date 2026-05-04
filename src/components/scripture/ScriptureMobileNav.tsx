import { BookOpen, CalendarDays, Home, Search } from 'lucide-react';

const items = [
  { label: 'Read', href: '/scripture', icon: BookOpen, active: true },
  { label: 'Plan', href: '/project52', icon: CalendarDays },
  { label: 'Home', href: '/', icon: Home },
  { label: 'Search', href: '#', icon: Search },
];

type ScriptureMobileNavProps = {
  darkMode: boolean;
};

const ScriptureMobileNav = ({ darkMode }: ScriptureMobileNavProps) => (
  <nav
    className={`fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t px-3 pb-3 pt-2 md:hidden ${
      darkMode ? 'border-white/10 bg-[#080808]/95' : 'border-black/10 bg-[#fffaf0]/95'
    }`}
    aria-label="Mobile Scripture navigation"
  >
    {items.map(({ active, href, icon: Icon, label }) => (
      <a
        key={label}
        href={href}
        className={`grid justify-items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-bold ${
          active ? 'text-red-800 dark:text-red-200' : darkMode ? 'text-stone-400' : 'text-zinc-500'
        }`}
      >
        <Icon size={19} />
        {label}
      </a>
    ))}
  </nav>
);

export default ScriptureMobileNav;
