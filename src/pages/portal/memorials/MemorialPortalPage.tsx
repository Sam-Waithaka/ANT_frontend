import { CalendarDays, Images, Radio, ScrollText } from 'lucide-react';
import MemorialPortalShell from '../../../components/portal/memorials/MemorialPortalShell';
import { portalSurface } from '../../../components/portal/portalSurface';
import { useTheme } from '../../../hooks/useTheme';

const readinessCards = [
  {
    description: 'Core memorial identity, portraits, hero imagery, dates, SEO, visibility, and workflow state.',
    icon: ScrollText,
    title: 'Page shell',
  },
  {
    description: 'Rich tribute sections can reuse the existing editor, Scripture blocks, and inline image rendering.',
    icon: Images,
    title: 'Written content',
  },
  {
    description: 'Gallery images, programmes, portraits, and representative photos stay backed by MediaAsset records.',
    icon: CalendarDays,
    title: 'Structured records',
  },
  {
    description: 'Recording sections point to audio-visual series, and livestream arrangements can adapt into the player.',
    icon: Radio,
    title: 'Recordings',
  },
];

const MemorialPortalPage = () => {
  const { darkMode } = useTheme();

  return (
    <MemorialPortalShell>
      <section className={`rounded-3xl border p-5 shadow-lg ${portalSurface.panel(darkMode)}`}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(18rem,0.18fr)] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">
              Foundation ready
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
              Memorial workspace
            </h2>
            <p className={`mt-4 max-w-3xl leading-7 ${portalSurface.mutedText(darkMode)}`}>
              The portal shell is in place for the memorial page registry, editor state, section authoring, media curation, and workflow panels.
            </p>
          </div>
          <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${portalSurface.mutedSurface(darkMode)}`}>
            Protected portal route
          </div>
        </div>
      </section>

      <section aria-label="Memorial implementation areas" className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {readinessCards.map(({ description, icon: Icon, title }) => (
          <article
            className={`rounded-3xl border p-5 shadow-lg ${portalSurface.card(darkMode)}`}
            key={title}
          >
            <span className={`grid size-12 place-items-center rounded-2xl ${portalSurface.iconBadge(darkMode)}`}>
              <Icon size={20} aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-serif text-2xl leading-tight">{title}</h3>
            <p className={`mt-3 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>
              {description}
            </p>
          </article>
        ))}
      </section>
    </MemorialPortalShell>
  );
};

export default MemorialPortalPage;
