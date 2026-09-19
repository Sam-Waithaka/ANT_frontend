import { useState, type FormEvent } from 'react';
import { usePortalToast } from '../../../../components/portal/PortalToast';
import { portalSurface } from '../../../../components/portal/portalSurface';
import { useAuth } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';
import { createMemorialChild, updateMemorialChild } from '../api/memorialPortalApi';
import ChildActions from '../components/ChildActions';
import { ApprovalBadge, MemorialButton, MemorialCard, MemorialError, MemorialField } from '../components/MemorialUi';
import { useMemorialPortal } from '../hooks/useMemorialPortal';
import { emptyContent, formatMemorialDateTime } from '../utils/presentation';

const TributesPage = () => {
  const { darkMode } = useTheme();
  const { accessToken } = useAuth();
  const toast = usePortalToast();
  const { moderation, refresh, refreshModeration, slug } = useMemorialPortal();
  const [kind, setKind] = useState<'ministry' | 'personal'>('ministry');
  const [ministryName, setMinistryName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<'all' | 'ministry' | 'personal'>('all');
  if (!moderation) return <MemorialError>Moderation access is required to manage contributions. Active writers can still submit a contribution from the Writing workspace.</MemorialError>;
  const capability = moderation.capabilities.children.tribute;
  const published = moderation.page.status === 'published';
  const items = moderation.tributes.filter((item) => filter === 'all' || item.kind === filter);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await createMemorialChild(accessToken, slug, 'tribute', {
        author_name: authorName,
        author_role: authorRole,
        content_json: emptyContent,
        expected_page_updated_at: moderation.page.updated_at,
        kind,
        ministry_name: kind === 'ministry' ? ministryName : '',
        position: moderation.tributes.length,
      });
      await refresh();
      setAuthorName(''); setAuthorRole(''); setMinistryName('');
      toast.success('Contribution created. Add its writing, then review and approve it.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create contribution.');
    } finally { setBusy(false); }
  };

  const saveMetadata = async (itemId: string, form: HTMLFormElement) => {
    const item = moderation.tributes.find((candidate) => candidate.id === itemId);
    if (!item) return;
    const data = new FormData(form);
    try {
      await updateMemorialChild(accessToken, slug, 'tribute', item.id, {
        author_name: String(data.get('author_name') ?? ''),
        author_role: String(data.get('author_role') ?? ''),
        expected_updated_at: item.updated_at,
        kind: String(data.get('kind')),
        ministry_name: String(data.get('kind')) === 'ministry' ? String(data.get('ministry_name') ?? '') : '',
      });
      await refreshModeration();
      toast.success(item.is_approved ? 'Contribution updated. Approval was cleared.' : 'Contribution updated.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to update contribution.'); }
  };

  return (
    <div className="grid gap-6">
      {published ? <MemorialError>Published memorials are locked. Unpublish before changing contributions.</MemorialError> : null}
      {capability.add && !published ? <MemorialCard darkMode={darkMode}>
        <h2 className="font-serif text-3xl">Create commissioned contribution</h2>
        <p className={`mt-2 text-sm ${portalSurface.softMutedText(darkMode)}`}>New contributions are unapproved. Continue in Writing to compose the Lexical body.</p>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={create}>
          <label className="grid gap-2 text-sm font-bold"><span>Contribution type</span><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} onChange={(event) => setKind(event.target.value as 'ministry' | 'personal')} value={kind}><option value="ministry">Ministry tribute</option><option value="personal">Personal reflection</option></select></label>
          {kind === 'ministry' ? <MemorialField label="Ministry name" onChange={(event) => setMinistryName(event.target.value)} required value={ministryName} /> : <div />}
          <MemorialField label="Author name" onChange={(event) => setAuthorName(event.target.value)} required value={authorName} />
          <MemorialField label="Author role" onChange={(event) => setAuthorRole(event.target.value)} value={authorRole} />
          <div><MemorialButton disabled={busy} type="submit">{busy ? 'Creating...' : 'Create contribution'}</MemorialButton></div>
        </form>
      </MemorialCard> : null}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="font-serif text-3xl">Contributions</h2><div className="flex gap-2">{(['all', 'ministry', 'personal'] as const).map((value) => <button className={`rounded-full px-4 py-2 text-sm font-black ${filter === value ? 'bg-red-800 text-white' : 'border border-[#d8cbbd] dark:border-white/10'}`} key={value} onClick={() => setFilter(value)} type="button">{value === 'all' ? 'All' : value === 'ministry' ? 'Ministry' : 'Personal'}</button>)}</div></div>
        <div className="mt-4 grid gap-4">
          {items.map((item) => {
            const media = moderation.media.filter((candidate) => candidate.tribute_id === item.id);
            return <MemorialCard darkMode={darkMode} key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-4"><div><ApprovalBadge item={item} /><h3 className="mt-3 text-xl font-black">{item.kind === 'ministry' ? item.ministry_name : item.author_name}</h3><p className={`mt-1 text-sm ${portalSurface.softMutedText(darkMode)}`}>{item.author_name}{item.author_role ? ` — ${item.author_role}` : ''} &middot; Updated {formatMemorialDateTime(item.updated_at)}</p>{media.length ? <p className="mt-2 text-xs font-bold">{media.length} associated image{media.length === 1 ? '' : 's'}</p> : null}</div><ChildActions capability={capability} item={item} items={moderation.tributes} type="tribute" /></div>
              {capability.change && !published ? <details className="mt-5"><summary className="cursor-pointer text-sm font-black text-red-800 dark:text-red-200">Edit attribution and type</summary><form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void saveMetadata(item.id, event.currentTarget); }}><label className="grid gap-2 text-sm font-bold"><span>Type</span><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} defaultValue={item.kind} name="kind"><option value="ministry">Ministry</option><option value="personal">Personal</option></select></label><MemorialField defaultValue={item.ministry_name} label="Ministry name" name="ministry_name" /><MemorialField defaultValue={item.author_name} label="Author name" name="author_name" required /><MemorialField defaultValue={item.author_role} label="Author role" name="author_role" /><div><MemorialButton type="submit">Save metadata</MemorialButton></div></form></details> : null}
            </MemorialCard>;
          })}
          {!items.length ? <MemorialCard darkMode={darkMode}><p className={portalSurface.softMutedText(darkMode)}>No visible contributions in this view.</p></MemorialCard> : null}
        </div>
      </section>
    </div>
  );
};

export default TributesPage;
