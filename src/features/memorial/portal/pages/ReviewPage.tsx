import { useState } from 'react';
import { Link } from 'react-router-dom';
import PortalModal from '../../../../components/portal/PortalModal';
import { usePortalToast } from '../../../../components/portal/PortalToast';
import { portalSurface } from '../../../../components/portal/portalSurface';
import { useAuth } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';
import { transitionMemorialPublication } from '../api/memorialPortalApi';
import { MemorialButton, MemorialCard, MemorialError } from '../components/MemorialUi';
import { useMemorialPortal } from '../hooks/useMemorialPortal';
import type { getMemorialPortalRoutes } from '../config';
import { workspaceCounts } from '../utils/presentation';

const areaForError = (key: string, routes: ReturnType<typeof getMemorialPortalRoutes>) => {
  if (/media|image|gallery|recording|programme/i.test(key)) return routes.media;
  if (/tribute|reflection/i.test(key)) return routes.tributes;
  if (/milestone|timeline/i.test(key)) return routes.timeline;
  if (/event|arrangement/i.test(key)) return routes.arrangements;
  if (/body|statement|family|hope|life/i.test(key)) return routes.writing;
  return routes.page;
};

const ReviewPage = () => {
  const { darkMode } = useTheme();
  const { accessToken } = useAuth();
  const toast = usePortalToast();
  const { moderation, routes, setModeration, slug } = useMemorialPortal();
  const [action, setAction] = useState<'publish' | 'unpublish' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!moderation) return <MemorialError>Moderation access is required to review publication readiness.</MemorialError>;
  const counts = workspaceCounts(moderation);
  const canPublish = moderation.capabilities.page.publish;

  const transition = async () => {
    if (!action) return;
    setBusy(true);
    setError('');
    try {
      const workspace = await transitionMemorialPublication(accessToken, slug, action, moderation.page.updated_at);
      setModeration(workspace);
      toast.success(action === 'publish' ? 'Memorial published and editing locked.' : 'Memorial unpublished. Editing is available again.');
      setAction(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Publication transition failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6">
      {error ? <MemorialError>{error}</MemorialError> : null}
      <MemorialCard darkMode={darkMode}>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">Publication</p><h2 className="mt-2 font-serif text-3xl">{moderation.publication.ready ? 'Ready for publication' : 'Review required'}</h2><p className={`mt-2 text-sm ${portalSurface.softMutedText(darkMode)}`}>{counts.awaitingApproval} awaiting approval &middot; {counts.processing} processing media</p></div>
          {canPublish ? moderation.page.status === 'published' ? <MemorialButton onClick={() => setAction('unpublish')} tone="danger" type="button">Unpublish memorial</MemorialButton> : <MemorialButton disabled={!moderation.publication.ready} onClick={() => setAction('publish')} type="button">Publish memorial</MemorialButton> : null}
        </div>
      </MemorialCard>
      <MemorialCard darkMode={darkMode}>
        <h2 className="font-serif text-3xl">Readiness checks</h2>
        {Object.keys(moderation.publication.errors).length ? <div className="mt-5 grid gap-3">{Object.entries(moderation.publication.errors).map(([key, messages]) => <Link className={`rounded-2xl border p-4 ${portalSurface.mutedSurface(darkMode)}`} key={key} to={areaForError(key, routes)}><p className="font-black">{key.replaceAll('_', ' ')}</p>{messages.map((message) => <p className={`mt-1 text-sm ${portalSurface.softMutedText(darkMode)}`} key={message}>{message}</p>)}<span className="mt-2 inline-flex text-sm font-black text-red-800 dark:text-red-200">Resolve issue &rarr;</span></Link>)}</div> : <p className={`mt-4 text-sm ${portalSurface.mutedText(darkMode)}`}>The backend reports no publication blockers. Unapproved children will remain absent from the public page.</p>}
      </MemorialCard>
      {action ? <PortalModal darkMode={darkMode} description={action === 'publish' ? 'Approved and enabled content will become eligible for the public API, and all editing will be locked.' : 'The memorial will no longer be publicly available. Editing resumes, and changed children must be reapproved before republishing.'} footer={<div className="flex justify-end gap-3"><MemorialButton disabled={busy} onClick={() => setAction(null)} tone="secondary" type="button">Cancel</MemorialButton><MemorialButton disabled={busy} onClick={() => void transition()} tone={action === 'unpublish' ? 'danger' : 'primary'} type="button">{busy ? 'Working...' : action === 'publish' ? 'Confirm publication' : 'Confirm unpublish'}</MemorialButton></div>} onClose={() => setAction(null)} title={action === 'publish' ? 'Publish this memorial?' : 'Unpublish this memorial?'}><p className={`text-sm leading-6 ${portalSurface.mutedText(darkMode)}`}>This action is revalidated by the server and does not bypass the separate public feature switch.</p></PortalModal> : null}
    </div>
  );
};

export default ReviewPage;
