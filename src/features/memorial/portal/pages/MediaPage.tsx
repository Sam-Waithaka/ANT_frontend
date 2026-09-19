import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import { usePortalToast } from '../../../../components/portal/PortalToast';
import { portalSurface } from '../../../../components/portal/portalSurface';
import { useAuth } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';
import {
  attachBorrowedImage,
  createMemorialChild,
  deleteMemorialChild,
  fetchSelectableAssets,
  replaceWithBorrowedImage,
  replaceWithUploadedImage,
  setMemorialChildApproval,
  updateMemorialChild,
  uploadMemorialImage,
} from '../api/memorialPortalApi';
import { ApprovalBadge, MemorialButton, MemorialCard, MemorialError, MemorialField, MemorialTextarea } from '../components/MemorialUi';
import { useMemorialPortal } from '../hooks/useMemorialPortal';
import type { MediaPurpose, ModerationMedia, SelectableAsset } from '../types';

const imagePurposes: Array<{ label: string; value: Exclude<MediaPurpose, 'recording' | 'programme'> }> = [
  { label: 'Hero portrait', value: 'hero' }, { label: 'SEO image', value: 'seo' }, { label: 'Life and service', value: 'life_and_service' },
  { label: 'Tribute image', value: 'tribute_image' }, { label: 'Milestone image', value: 'milestone_image' }, { label: 'Gallery', value: 'gallery' }, { label: 'Family', value: 'family' },
];

const MediaPage = () => {
  const { darkMode } = useTheme();
  const { accessToken } = useAuth();
  const toast = usePortalToast();
  const { moderation, refresh, slug } = useMemorialPortal();
  const [assets, setAssets] = useState<SelectableAsset[]>([]);
  const [assetError, setAssetError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'borrow' | 'upload' | 'external'>('borrow');
  useEffect(() => {
    if (!moderation?.capabilities.media.select) return;
    const controller = new AbortController();
    fetchSelectableAssets(accessToken, slug, controller.signal).then((response) => setAssets(response.assets)).catch((error) => { if (!controller.signal.aborted) setAssetError(error instanceof Error ? error.message : 'Unable to load shared images.'); });
    return () => controller.abort();
  }, [accessToken, moderation?.capabilities.media.select, slug]);

  if (!moderation) return <MemorialError>Moderation access is required to manage memorial media.</MemorialError>;
  const capability = moderation.capabilities.children.media;
  const published = moderation.page.status === 'published';

  const formImagePayload = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const purpose = String(data.get('purpose')) as Exclude<MediaPurpose, 'recording' | 'programme'>;
    return {
      alt_text: String(data.get('alt_text') ?? ''), caption: String(data.get('caption') ?? ''), credit: String(data.get('credit') ?? ''),
      expected_page_updated_at: moderation.page.updated_at, milestone_id: purpose === 'milestone_image' ? String(data.get('milestone_id') ?? '') || null : null,
      position: Number(data.get('position') ?? 0), purpose, tribute_id: purpose === 'tribute_image' ? String(data.get('tribute_id') ?? '') || null : null,
    };
  };

  const addImage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      if (mode === 'borrow') {
        await attachBorrowedImage(accessToken, slug, { ...formImagePayload(event.currentTarget), asset_uuid: String(data.get('asset_uuid') ?? '') });
      } else {
        const upload = data.get('upload');
        if (!(upload instanceof File) || !upload.size) throw new Error('Choose an image to upload.');
        if (data.get('public_availability_confirmed') !== 'on') throw new Error('Confirm that this image may be made publicly available.');
        await uploadMemorialImage(accessToken, slug, { ...formImagePayload(event.currentTarget), public_availability_confirmed: true, title: String(data.get('title') ?? ''), upload });
      }
      await refresh(); event.currentTarget.reset(); toast.success(mode === 'borrow' ? 'Shared image attached. Review and approve it.' : 'Image uploaded. Processing status will refresh while this screen is open.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to attach image.'); }
    finally { setBusy(false); }
  };

  const addExternal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); const data = new FormData(event.currentTarget);
    const sourceKind = String(data.get('source_kind')) as 'recording' | 'programme';
    try {
      await createMemorialChild(accessToken, slug, 'media', {
        caption: String(data.get('caption') ?? ''), credit: String(data.get('credit') ?? ''), display_title: String(data.get('display_title') ?? ''),
        duration_seconds: data.get('duration_seconds') ? Number(data.get('duration_seconds')) : null, expected_page_updated_at: moderation.page.updated_at,
        external_url: String(data.get('external_url') ?? ''), position: moderation.media.length, provider: String(data.get('provider')) as 'youtube' | 'external',
        programme_format: sourceKind === 'programme' ? String(data.get('programme_format')) as 'pdf' | 'webpage' : undefined,
        recorded_on: String(data.get('recorded_on') ?? '') || null, recording_kind: sourceKind === 'recording' ? String(data.get('recording_kind')) as 'sermon' | 'speech' | 'audio' | 'video' : undefined,
        source_kind: sourceKind, speaker_name: String(data.get('speaker_name') ?? ''),
      });
      await refresh(); event.currentTarget.reset(); toast.success('External media reference created. Review and approve it.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to add external media.'); }
    finally { setBusy(false); }
  };

  const mediaOperation = async (operation: () => Promise<unknown>, message: string) => {
    try { await operation(); await refresh(); toast.success(message); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to update memorial media.'); }
  };

  const editMetadata = async (item: ModerationMedia, form: HTMLFormElement) => {
    const data = new FormData(form);
    await mediaOperation(() => updateMemorialChild(accessToken, slug, 'media', item.id, {
      alt_text: String(data.get('alt_text') ?? ''), caption: String(data.get('caption') ?? ''), credit: String(data.get('credit') ?? ''),
      display_title: String(data.get('display_title') ?? ''), duration_seconds: data.get('duration_seconds') ? Number(data.get('duration_seconds')) : null,
      expected_updated_at: item.updated_at, position: Number(data.get('position') ?? item.position), recorded_on: String(data.get('recorded_on') ?? '') || null,
      speaker_name: String(data.get('speaker_name') ?? ''),
    }), item.is_approved ? 'Media updated. Approval was cleared.' : 'Media metadata updated.');
  };

  const replace = async (item: ModerationMedia, form: HTMLFormElement, uploadMode: boolean) => {
    const data = new FormData(form);
    const common = { alt_text: String(data.get('alt_text') ?? item.alt_text), caption: String(data.get('caption') ?? ''), credit: String(data.get('credit') ?? ''), expected_link_updated_at: item.updated_at, expected_page_updated_at: moderation.page.updated_at };
    if (uploadMode) {
      const upload = data.get('upload'); if (!(upload instanceof File) || !upload.size) return toast.error('Choose a replacement image.');
      if (data.get('public_availability_confirmed') !== 'on') return toast.error('Confirm public availability for the replacement.');
      await mediaOperation(() => replaceWithUploadedImage(accessToken, slug, item.id, { ...common, public_availability_confirmed: true, title: String(data.get('title') ?? ''), upload }), 'Replacement uploaded. The new link is unapproved.');
    } else await mediaOperation(() => replaceWithBorrowedImage(accessToken, slug, item.id, { ...common, asset_uuid: String(data.get('asset_uuid') ?? '') }), 'Image replaced. The new link is unapproved.');
  };

  return <div className="grid gap-6">
    {published ? <MemorialError>Published memorials are locked. Unpublish before changing media.</MemorialError> : null}
    {assetError ? <MemorialError>{assetError}</MemorialError> : null}
    {capability.add && !published ? <MemorialCard darkMode={darkMode}><div className="flex flex-wrap gap-2">{(['borrow', 'upload', 'external'] as const).map((value) => <button className={`rounded-full px-4 py-2 text-sm font-black ${mode === value ? 'bg-red-800 text-white' : 'border border-[#d8cbbd] dark:border-white/10'}`} key={value} onClick={() => setMode(value)} type="button">{value === 'borrow' ? 'Choose shared image' : value === 'upload' ? 'Upload image' : 'Recording or programme'}</button>)}</div>
      {mode === 'external' ? <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={addExternal}><label className="grid gap-2 text-sm font-bold"><span>Source</span><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} name="source_kind"><option value="recording">Recording</option><option value="programme">Programme</option></select></label><MemorialField label="Display title" name="display_title" required /><MemorialField label="HTTPS URL" name="external_url" required type="url" /><label className="grid gap-2 text-sm font-bold"><span>Provider</span><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} name="provider"><option value="external">External link</option><option value="youtube">YouTube</option></select></label><label className="grid gap-2 text-sm font-bold"><span>Recording kind</span><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} name="recording_kind"><option value="sermon">Sermon</option><option value="speech">Speech</option><option value="audio">Audio</option><option value="video">Video</option></select></label><label className="grid gap-2 text-sm font-bold"><span>Programme format</span><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} name="programme_format"><option value="pdf">PDF</option><option value="webpage">Webpage</option></select></label><MemorialField label="Speaker" name="speaker_name" /><MemorialField label="Recorded on" name="recorded_on" type="date" /><MemorialField label="Duration in seconds" min="0" name="duration_seconds" type="number" /><MemorialTextarea label="Caption" name="caption" /><MemorialField label="Credit" name="credit" /><div><MemorialButton disabled={busy} type="submit">Add reference</MemorialButton></div></form> : <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={addImage}>{mode === 'borrow' ? <label className="grid gap-2 text-sm font-bold"><span>Shared image</span><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} name="asset_uuid" required><option value="">Choose an eligible image</option>{assets.map((asset) => <option key={asset.uuid} value={asset.uuid}>{asset.title}</option>)}</select></label> : <><MemorialField accept="image/*" label="Image file" name="upload" required type="file" /><MemorialField label="Asset title" name="title" required /></>}<label className="grid gap-2 text-sm font-bold"><span>Placement</span><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} name="purpose">{imagePurposes.map((purpose) => <option key={purpose.value} value={purpose.value}>{purpose.label}</option>)}</select></label><MemorialField label="Alt text" name="alt_text" required /><MemorialTextarea label="Caption" name="caption" /><MemorialField label="Credit" name="credit" /><MemorialField defaultValue={moderation.media.length} label="Position" min="0" name="position" type="number" /><label className="grid gap-2 text-sm font-bold"><span>Related tribute</span><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} name="tribute_id"><option value="">None</option>{moderation.tributes.map((item) => <option key={item.id} value={item.id}>{item.author_name}</option>)}</select></label><label className="grid gap-2 text-sm font-bold"><span>Related milestone</span><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} name="milestone_id"><option value="">None</option>{moderation.milestones.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>{mode === 'upload' ? <label className="col-span-full flex items-start gap-3 rounded-2xl border border-amber-600/30 bg-amber-50 p-4 text-sm font-bold text-amber-950 dark:bg-amber-950/20 dark:text-amber-100"><input className="mt-0.5 size-5 accent-red-800" name="public_availability_confirmed" required type="checkbox" /> I confirm this image is authorized for public availability on the memorial.</label> : null}<div><MemorialButton disabled={busy} type="submit">{mode === 'borrow' ? 'Attach image' : 'Upload and attach'}</MemorialButton></div></form>}
    </MemorialCard> : null}

    <section><h2 className="font-serif text-3xl">Memorial media</h2><div className="mt-4 grid gap-4">{moderation.media.map((item) => <MemorialCard darkMode={darkMode} key={item.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2"><ApprovalBadge item={item} /><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-700 dark:bg-white/10 dark:text-stone-200">{item.processing.label}</span></div><h3 className="mt-3 text-xl font-black">{item.display_title || item.alt_text || item.purpose.replaceAll('_', ' ')}</h3><p className={`mt-1 text-sm ${portalSurface.softMutedText(darkMode)}`}>{item.source_kind} · {item.purpose.replaceAll('_', ' ')} · {item.provenance}</p></div><div className="flex flex-wrap gap-2">{capability.approve && !published ? <MemorialButton disabled={!item.is_approved && !item.processing.can_approve} onClick={() => void mediaOperation(() => setMemorialChildApproval(accessToken, slug, 'media', item.id, !item.is_approved, item.updated_at), item.is_approved ? 'Media approval revoked.' : 'Media approved.')} tone="secondary" type="button">{item.is_approved ? <><RotateCcw size={14} /> Revoke</> : <><CheckCircle2 size={14} /> Approve</>}</MemorialButton> : null}{capability.delete && !published ? <MemorialButton onClick={() => { if (window.confirm('Delete only this memorial media link? The shared asset will be retained.')) void mediaOperation(() => deleteMemorialChild(accessToken, slug, 'media', item.id, item.updated_at), 'Memorial media link removed. Shared media was retained.'); }} tone="danger" type="button"><Trash2 size={14} /> Delete link</MemorialButton> : null}</div></div>
        {capability.change && !published ? <details className="mt-5"><summary className="cursor-pointer text-sm font-black text-red-800 dark:text-red-200">Edit metadata</summary><form className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={(event) => { event.preventDefault(); void editMetadata(item, event.currentTarget); }}><MemorialField defaultValue={item.display_title} label="Display title" name="display_title" /><MemorialField defaultValue={item.alt_text} label="Alt text" name="alt_text" required={item.source_kind === 'image'} /><MemorialTextarea defaultValue={item.caption} label="Caption" name="caption" /><MemorialField defaultValue={item.credit} label="Credit" name="credit" /><MemorialField defaultValue={item.speaker_name ?? ''} label="Speaker" name="speaker_name" /><MemorialField defaultValue={item.recorded_on ?? ''} label="Recorded on" name="recorded_on" type="date" /><MemorialField defaultValue={item.duration_seconds ?? ''} label="Duration seconds" min="0" name="duration_seconds" type="number" /><MemorialField defaultValue={item.position} label="Position" min="0" name="position" type="number" /><div><MemorialButton type="submit">Save metadata</MemorialButton></div></form></details> : null}
        {item.source_kind === 'image' && !published && (moderation.capabilities.media.replace || moderation.capabilities.media.replace_with_upload) ? <details className="mt-4"><summary className="cursor-pointer text-sm font-black text-red-800 dark:text-red-200">Replace image safely</summary><div className="mt-4 grid gap-4 lg:grid-cols-2">{moderation.capabilities.media.replace ? <form className={`grid gap-3 rounded-2xl border p-4 ${portalSurface.mutedSurface(darkMode)}`} onSubmit={(event) => { event.preventDefault(); void replace(item, event.currentTarget, false); }}><h4 className="font-black">Use shared image</h4><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} name="asset_uuid" required><option value="">Choose image</option>{assets.map((asset) => <option key={asset.uuid} value={asset.uuid}>{asset.title}</option>)}</select><MemorialField defaultValue={item.alt_text} label="Alt text" name="alt_text" required /><MemorialField defaultValue={item.caption} label="Caption" name="caption" /><MemorialField defaultValue={item.credit} label="Credit" name="credit" /><MemorialButton type="submit">Replace with shared image</MemorialButton></form> : null}{moderation.capabilities.media.replace_with_upload ? <form className={`grid gap-3 rounded-2xl border p-4 ${portalSurface.mutedSurface(darkMode)}`} onSubmit={(event) => { event.preventDefault(); void replace(item, event.currentTarget, true); }}><h4 className="font-black">Upload replacement</h4><MemorialField accept="image/*" label="Image file" name="upload" required type="file" /><MemorialField label="Asset title" name="title" required /><MemorialField defaultValue={item.alt_text} label="Alt text" name="alt_text" required /><MemorialField defaultValue={item.caption} label="Caption" name="caption" /><MemorialField defaultValue={item.credit} label="Credit" name="credit" /><label className="flex gap-3 text-sm font-bold"><input className="size-5 accent-red-800" name="public_availability_confirmed" required type="checkbox" /> Confirm public availability</label><MemorialButton type="submit">Upload replacement</MemorialButton></form> : null}</div></details> : null}
      </MemorialCard>)}{!moderation.media.length ? <MemorialCard darkMode={darkMode}>No memorial media links have been created.</MemorialCard> : null}</div></section>
  </div>;
};

export default MediaPage;
