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

const TimelinePage = () => {
  const { darkMode } = useTheme();
  const { accessToken } = useAuth();
  const toast = usePortalToast();
  const { moderation, refresh, refreshModeration, slug } = useMemorialPortal();
  const [title, setTitle] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [occurredOn, setOccurredOn] = useState('');
  const [busy, setBusy] = useState(false);
  if (!moderation) return <MemorialError>Moderation access is required to manage the leadership timeline.</MemorialError>;
  const capability = moderation.capabilities.children.milestone;
  const published = moderation.page.status === 'published';

  const create = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true);
    try {
      await createMemorialChild(accessToken, slug, 'milestone', { content_json: emptyContent, date_label: dateLabel, expected_page_updated_at: moderation.page.updated_at, occurred_on: occurredOn || null, position: moderation.milestones.length, title });
      await refresh(); setTitle(''); setDateLabel(''); setOccurredOn('');
      toast.success('Milestone created. Add its description in Writing, then approve it.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to create milestone.'); }
    finally { setBusy(false); }
  };

  const update = async (itemId: string, form: HTMLFormElement) => {
    const item = moderation.milestones.find((candidate) => candidate.id === itemId);
    if (!item) return;
    const data = new FormData(form);
    try {
      await updateMemorialChild(accessToken, slug, 'milestone', item.id, { date_label: String(data.get('date_label') ?? ''), expected_updated_at: item.updated_at, occurred_on: String(data.get('occurred_on') ?? '') || null, title: String(data.get('title') ?? '') });
      await refreshModeration(); toast.success(item.is_approved ? 'Milestone updated. Approval was cleared.' : 'Milestone updated.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to update milestone.'); }
  };

  return <div className="grid gap-6">
    {published ? <MemorialError>Published memorials are locked. Unpublish before changing the timeline.</MemorialError> : null}
    {capability.add && !published ? <MemorialCard darkMode={darkMode}><h2 className="font-serif text-3xl">Add leadership milestone</h2><form className="mt-5 grid gap-4 md:grid-cols-3" onSubmit={create}><MemorialField label="Date label" hint="A year or approved human-readable label." onChange={(event) => setDateLabel(event.target.value)} required value={dateLabel} /><MemorialField label="Exact date (optional)" onChange={(event) => setOccurredOn(event.target.value)} type="date" value={occurredOn} /><MemorialField label="Title" onChange={(event) => setTitle(event.target.value)} required value={title} /><div><MemorialButton disabled={busy} type="submit">{busy ? 'Adding...' : 'Add milestone'}</MemorialButton></div></form></MemorialCard> : null}
    <section><h2 className="font-serif text-3xl">Leadership timeline</h2><div className="mt-4 grid gap-4">{moderation.milestones.map((item) => <MemorialCard darkMode={darkMode} key={item.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><ApprovalBadge item={item} /><p className="mt-3 text-xs font-black uppercase tracking-[0.15em] text-red-800 dark:text-red-200">{item.date_label}</p><h3 className="mt-1 text-xl font-black">{item.title}</h3><p className={`mt-1 text-sm ${portalSurface.softMutedText(darkMode)}`}>{item.occurred_on || 'No exact date'} &middot; Updated {formatMemorialDateTime(item.updated_at)}</p></div><ChildActions capability={capability} item={item} items={moderation.milestones} type="milestone" /></div>{capability.change && !published ? <details className="mt-5"><summary className="cursor-pointer text-sm font-black text-red-800 dark:text-red-200">Edit milestone details</summary><form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); void update(item.id, event.currentTarget); }}><MemorialField defaultValue={item.date_label} label="Date label" name="date_label" required /><MemorialField defaultValue={item.occurred_on ?? ''} label="Exact date" name="occurred_on" type="date" /><MemorialField defaultValue={item.title} label="Title" name="title" required /><div><MemorialButton type="submit">Save details</MemorialButton></div></form></details> : null}</MemorialCard>)}{!moderation.milestones.length ? <MemorialCard darkMode={darkMode}>No milestones have been created.</MemorialCard> : null}</div></section>
  </div>;
};

export default TimelinePage;
