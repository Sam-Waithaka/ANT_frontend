import { FilePenLine, Images, Quote, Rocket, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { portalSurface } from '../../../../components/portal/portalSurface';
import { useTheme } from '../../../../hooks/useTheme';
import { useMemorialPortal } from '../hooks/useMemorialPortal';
import { formatMemorialDateTime, statusLabel, workspaceCounts } from '../utils/presentation';
import { MemorialCard, MemorialError } from '../components/MemorialUi';

const OverviewPage = () => {
  const { darkMode } = useTheme();
  const { error, loading, moderation, moderationForbidden, refresh, routes, writeups } = useMemorialPortal();

  if (loading) return <p role="status">Loading the memorial workspace...</p>;
  if (error && !writeups) return <MemorialError>{error} <button className="underline" onClick={() => void refresh()} type="button">Try again</button></MemorialError>;

  const counts = moderation ? workspaceCounts(moderation) : null;
  const cards = [
    { description: 'Edit the five memorial narratives and repeated-item details in the established editor.', href: routes.writing, icon: FilePenLine, title: 'Writing' },
    ...(moderation?.capabilities.page.view ? [{ description: 'Manage identity, headings, visibility, introductions, Scripture and SEO.', href: routes.page, icon: Settings2, title: 'Page and sections' }] : []),
    ...(moderation?.capabilities.children.tribute.view ? [{ description: 'Review ministry tributes and commissioned personal reflections.', href: routes.tributes, icon: Quote, title: 'Contributions' }] : []),
    ...(moderation?.capabilities.children.media.view ? [{ description: 'Select, upload, replace, review and approve memorial media.', href: routes.media, icon: Images, title: 'Media' }] : []),
    ...(moderation?.capabilities.page.view ? [{ description: 'Resolve readiness issues and publish or unpublish deliberately.', href: routes.review, icon: Rocket, title: 'Publication review' }] : []),
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.6fr)]">
        <MemorialCard darkMode={darkMode}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">Current state</p>
              <h2 className="mt-2 font-serif text-3xl">{moderation ? statusLabel(moderation.page.status) : 'Writing access'}</h2>
              <p className={`mt-2 text-sm ${portalSurface.softMutedText(darkMode)}`}>Last updated {formatMemorialDateTime(moderation?.page.updated_at ?? writeups?.updated_at)}</p>
            </div>
          </div>
          {moderation ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className={`rounded-2xl border p-4 ${portalSurface.mutedSurface(darkMode)}`}><p className="text-2xl font-black">{counts?.awaitingApproval ?? 0}</p><p className="text-sm">Awaiting approval</p></div>
              <div className={`rounded-2xl border p-4 ${portalSurface.mutedSurface(darkMode)}`}><p className="text-2xl font-black">{counts?.processing ?? 0}</p><p className="text-sm">Processing media</p></div>
              <div className={`rounded-2xl border p-4 ${portalSurface.mutedSurface(darkMode)}`}><p className="text-2xl font-black">{moderation.publication.ready ? 'Ready' : Object.keys(moderation.publication.errors).length}</p><p className="text-sm">Publication readiness</p></div>
            </div>
          ) : null}
          {moderationForbidden ? <p className={`mt-5 text-sm leading-6 ${portalSurface.mutedText(darkMode)}`}>You can contribute writing. Memorial moderation is available only to explicitly permitted users.</p> : null}
        </MemorialCard>

        <MemorialCard darkMode={darkMode}>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">Editing rule</p>
          <h2 className="mt-2 font-serif text-2xl">{writeups?.editable ? 'Open for editing' : 'Read-only while published'}</h2>
          <p className={`mt-3 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>{writeups?.editable ? 'Saving creates draft changes. Approval and publication remain separate actions.' : 'An authorized publisher must unpublish before content can be changed.'}</p>
        </MemorialCard>
      </section>

      <section>
        <h2 className="text-xs font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">Available workspaces</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ description, href, icon: Icon, title }) => (
            <Link className={`group rounded-3xl border p-5 shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 ${portalSurface.card(darkMode)}`} key={href} to={href}>
              <Icon className="text-red-800 dark:text-red-200" size={22} />
              <h3 className="mt-4 text-xl font-black">{title}</h3>
              <p className={`mt-2 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>{description}</p>
              <span className="mt-4 inline-flex text-sm font-black text-red-800 dark:text-red-200">Open workspace &rarr;</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default OverviewPage;
