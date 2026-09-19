import { useState, type FormEvent } from 'react';
import { usePortalToast } from '../../../../components/portal/PortalToast';
import { portalSurface } from '../../../../components/portal/portalSurface';
import { useAuth } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';
import { createMemorialChild, updateMemorialChild } from '../api/memorialPortalApi';
import ChildActions from '../components/ChildActions';
import { ApprovalBadge, MemorialButton, MemorialCard, MemorialError, MemorialField } from '../components/MemorialUi';
import { useMemorialPortal } from '../hooks/useMemorialPortal';
import type { ModerationServiceEvent } from '../types';
import { emptyContent, formatMemorialDateTime } from '../utils/presentation';

const eventLabels = { prayer_meeting: 'Prayer meeting', memorial_service: 'Memorial service', funeral: 'Funeral' } as const;
const toApiTimestamp = (value: string) => value ? `${value}:00+03:00` : null;
const toLocalInput = (value: string | null) => value ? new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Nairobi' }).format(new Date(value)).replace(' ', 'T') : '';

const EventFields = ({ darkMode, item }: { darkMode: boolean; item?: ModerationServiceEvent }) => <>
  <label className="grid gap-2 text-sm font-bold"><span>Event type</span><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} defaultValue={item?.kind ?? 'memorial_service'} name="kind"><option value="prayer_meeting">Prayer meeting</option><option value="memorial_service">Memorial service</option><option value="funeral">Funeral</option></select></label>
  <MemorialField defaultValue={item?.title ?? ''} label="Title" name="title" required />
  <MemorialField defaultValue={item?.event_date ?? ''} label="Exact date" name="event_date" type="date" />
  <MemorialField defaultValue={item?.date_label ?? ''} hint="Use only when separately approved, such as Details to follow." label="Date label" name="date_label" />
  <MemorialField defaultValue={toLocalInput(item?.starts_at ?? null)} label="Starts in Africa/Nairobi" name="starts_at" type="datetime-local" />
  <MemorialField defaultValue={toLocalInput(item?.ends_at ?? null)} label="Ends in Africa/Nairobi" name="ends_at" type="datetime-local" />
  <MemorialField defaultValue={item?.location_name ?? ''} label="Location name" name="location_name" />
  <MemorialField defaultValue={item?.location_address ?? ''} label="Location address" name="location_address" />
  <MemorialField defaultValue={item?.livestream_url ?? ''} label="Livestream URL" name="livestream_url" type="url" />
</>;

const payloadFrom = (form: HTMLFormElement) => {
  const data = new FormData(form);
  return {
    date_label: String(data.get('date_label') ?? ''),
    ends_at: toApiTimestamp(String(data.get('ends_at') ?? '')),
    event_date: String(data.get('event_date') ?? '') || null,
    kind: String(data.get('kind')) as ModerationServiceEvent['kind'],
    livestream_url: String(data.get('livestream_url') ?? ''),
    location_address: String(data.get('location_address') ?? ''),
    location_name: String(data.get('location_name') ?? ''),
    starts_at: toApiTimestamp(String(data.get('starts_at') ?? '')),
    title: String(data.get('title') ?? ''),
  };
};

const ArrangementsPage = () => {
  const { darkMode } = useTheme();
  const { accessToken } = useAuth();
  const toast = usePortalToast();
  const { moderation, refresh, refreshModeration, slug } = useMemorialPortal();
  const [busy, setBusy] = useState(false);
  if (!moderation) return <MemorialError>Moderation access is required to manage service arrangements.</MemorialError>;
  const capability = moderation.capabilities.children.service_event;
  const published = moderation.page.status === 'published';

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true);
    try {
      await createMemorialChild(accessToken, slug, 'service_event', { ...payloadFrom(event.currentTarget), content_json: emptyContent, expected_page_updated_at: moderation.page.updated_at, position: moderation.service_events.length });
      await refresh(); event.currentTarget.reset(); toast.success('Service event created. Add details in Writing, then approve it.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to create service event.'); }
    finally { setBusy(false); }
  };

  const update = async (item: ModerationServiceEvent, form: HTMLFormElement) => {
    try {
      await updateMemorialChild(accessToken, slug, 'service_event', item.id, { ...payloadFrom(form), expected_updated_at: item.updated_at });
      await refreshModeration(); toast.success(item.is_approved ? 'Event updated. Approval was cleared.' : 'Event updated.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to update service event.'); }
  };

  return <div className="grid gap-6">
    {published ? <MemorialError>Published memorials are locked. Unpublish before changing arrangements.</MemorialError> : null}
    <MemorialCard darkMode={darkMode}><h2 className="font-serif text-3xl">Arrangement writing</h2><p className={`mt-2 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>Use the Writing workspace for the arrangements introduction or “Details to follow” copy. This screen manages structured events and schedules.</p></MemorialCard>
    {capability.add && !published ? <MemorialCard darkMode={darkMode}><h2 className="font-serif text-3xl">Add service event</h2><form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={create}><EventFields darkMode={darkMode} /><div><MemorialButton disabled={busy} type="submit">{busy ? 'Adding...' : 'Add event'}</MemorialButton></div></form></MemorialCard> : null}
    <section><h2 className="font-serif text-3xl">Prayer and funeral schedule</h2><div className="mt-4 grid gap-4">{moderation.service_events.map((item) => <MemorialCard darkMode={darkMode} key={item.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><ApprovalBadge item={item} /><p className="mt-3 text-xs font-black uppercase tracking-[0.15em] text-red-800 dark:text-red-200">{eventLabels[item.kind]}</p><h3 className="mt-1 text-xl font-black">{item.title}</h3><p className={`mt-1 text-sm ${portalSurface.softMutedText(darkMode)}`}>{item.starts_at ? formatMemorialDateTime(item.starts_at) : item.event_date || item.date_label || 'Date not confirmed'}{item.location_name ? ` · ${item.location_name}` : ''}</p></div><ChildActions capability={capability} item={item} items={moderation.service_events} type="service_event" /></div>{capability.change && !published ? <details className="mt-5"><summary className="cursor-pointer text-sm font-black text-red-800 dark:text-red-200">Edit schedule and location</summary><form className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={(event) => { event.preventDefault(); void update(item, event.currentTarget); }}><EventFields darkMode={darkMode} item={item} /><div><MemorialButton type="submit">Save event</MemorialButton></div></form></details> : null}</MemorialCard>)}{!moderation.service_events.length ? <MemorialCard darkMode={darkMode}>No service events have been created.</MemorialCard> : null}</div></section>
  </div>;
};

export default ArrangementsPage;
