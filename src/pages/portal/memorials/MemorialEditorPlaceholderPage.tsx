import { ArrowLeft, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import MemorialPortalShell from '../../../components/portal/memorials/MemorialPortalShell';
import { portalSurface } from '../../../components/portal/portalSurface';
import { useTheme } from '../../../hooks/useTheme';

const MemorialEditorPlaceholderPage = () => {
  const { id = '' } = useParams();
  const { darkMode } = useTheme();

  return (
    <MemorialPortalShell compact>
      <Link
        className={darkMode ? 'inline-flex items-center gap-2 text-xs font-bold text-stone-400 transition hover:text-stone-100' : 'inline-flex items-center gap-2 text-xs font-bold text-[#786f66] transition hover:text-zinc-950'}
        to="/portal/memorials"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to memorials
      </Link>

      <section className={`mt-6 rounded-3xl border p-6 shadow-lg ${portalSurface.panel(darkMode)}`}>
        <span className={`grid size-12 place-items-center rounded-2xl ${portalSurface.iconBadge(darkMode)}`}>
          <FileText size={20} aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-red-800">
          Memorial editor
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
          Memorial shell selected
        </h1>
        <p className={`mt-4 max-w-2xl leading-7 ${portalSurface.mutedText(darkMode)}`}>
          Page id {id} is ready for the editor-state hydration phase. The next phase will load the bundled memorial editor payload and attach the section editors.
        </p>
      </section>
    </MemorialPortalShell>
  );
};

export default MemorialEditorPlaceholderPage;
