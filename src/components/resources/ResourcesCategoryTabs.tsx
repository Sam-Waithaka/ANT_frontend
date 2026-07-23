import { FileText, Grid2X2 } from 'lucide-react';
import type { PublicResourceType } from '../../types/writing';

type ResourceCategory = {
  key: string;
  label: string;
  href: string;
};

type ResourcesCategoryTabsProps = {
  darkMode: boolean;
  resourceTypes?: PublicResourceType[];
};

const ResourcesCategoryTabs = ({ darkMode, resourceTypes = [] }: ResourcesCategoryTabsProps) => {
  const currentPath = typeof window === 'undefined' ? '/resources' : window.location.pathname;
  const categories: ResourceCategory[] = [
    { key: 'all', label: 'All', href: '/resources' },
    ...resourceTypes.map((resourceType) => ({
      key: String(resourceType.slug || resourceType.id),
      label: resourceType.name,
      href: `/resources/type/${encodeURIComponent(String(resourceType.slug || resourceType.id))}`,
    })),
  ];

  return (
    <nav className="-mt-7 px-4 sm:px-6 lg:px-8" aria-label="Resource library categories">
      <div
        className={`relative z-10 grid gap-2 overflow-x-auto rounded-2xl border p-2 shadow-2xl backdrop-blur-xl sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:auto-cols-fr xl:grid-flow-col ${
          darkMode ? 'border-white/10 bg-black/55 shadow-black/30' : 'border-black/10 bg-white/90 shadow-zinc-900/10'
        }`}
      >
        {categories.map((category, index) => {
          const Icon = index === 0 ? Grid2X2 : FileText;
          const isActive = currentPath === category.href || (category.key === 'all' && currentPath === '/resources/');

          return (
            <a
              key={category.key}
              aria-current={isActive ? 'page' : undefined}
              href={category.href}
              className={`flex min-h-12 min-w-36 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition lg:min-w-0 ${
                isActive
                  ? 'bg-red-800 text-white shadow-md shadow-red-950/30'
                  : darkMode
                    ? 'text-stone-300 hover:bg-white/10 hover:text-white'
                    : 'text-zinc-700 hover:bg-[#fffaf0] hover:text-zinc-950'
              }`}
            >
              <Icon size={17} aria-hidden="true" />
              {category.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default ResourcesCategoryTabs;
