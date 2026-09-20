import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import CoverImagePicker from '../writing/media/CoverImagePicker';
import MemorialWorkflowControls from './MemorialWorkflowControls';
import { usePortalToast } from '../PortalToast';
import { portalSurface } from '../portalSurface';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import {
  normalizeMediaAssetForDisplay,
  type MediaAsset,
} from '../../../services/mediaAssetsApi';
import { updateMemorialPage } from '../../../services/memorialApi';
import type {
  MemorialId,
  MemorialPage,
  MemorialPageUpdatePayload,
  MemorialWorkflowStatus,
} from '../../../types/memorial';
import { MEMORIAL_WORKFLOW_STATUSES, getMemorialStatusLabel } from '../../../utils/memorialWorkflow';
import { canUploadMedia } from '../../../utils/permissions';

type MemorialPageSettingsPanelProps = {
  onPageUpdated: (page: MemorialPage) => void;
  page: MemorialPage;
};

type MemorialPageFormState = {
  birthDate: string;
  deathDate: string;
  fullName: string;
  heroImageId: string;
  isFeatured: boolean;
  isVisible: boolean;
  metaDescription: string;
  metaTitle: string;
  portraitImageId: string;
  roleTitle: string;
  slug: string;
  status: MemorialWorkflowStatus;
  summary: string;
  yearsOfService: string;
};

const textValue = (value?: string | null) => value || '';
const dateInputValue = (value?: string | null) => textValue(value).slice(0, 10);
const idString = (value?: MemorialId | null) => value === undefined || value === null ? '' : String(value);
const datePayloadValue = (value: string) => value.trim() || null;
const mediaPayloadValue = (value: string) => value.trim() || null;

const readMediaId = (
  id?: MemorialId | null,
  detail?: { id?: MemorialId } | null,
) => idString(id ?? detail?.id ?? null);

const formFromPage = (page: MemorialPage): MemorialPageFormState => ({
  birthDate: dateInputValue(page.birth_date),
  deathDate: dateInputValue(page.death_date),
  fullName: textValue(page.full_name),
  heroImageId: readMediaId(page.hero_image, page.hero_image_detail),
  isFeatured: Boolean(page.is_featured),
  isVisible: Boolean(page.is_visible),
  metaDescription: textValue(page.meta_description),
  metaTitle: textValue(page.meta_title),
  portraitImageId: readMediaId(page.portrait_image, page.portrait_image_detail),
  roleTitle: textValue(page.role_title),
  slug: textValue(page.slug),
  status: page.status,
  summary: textValue(page.summary),
  yearsOfService: textValue(page.years_of_service),
});

const sameId = (left?: MemorialId | null, right?: MemorialId | null) =>
  idString(left) === idString(right);

const assignIfChanged = <Key extends keyof MemorialPageUpdatePayload>(
  payload: MemorialPageUpdatePayload,
  key: Key,
  current: MemorialPageUpdatePayload[Key],
  next: MemorialPageUpdatePayload[Key],
) => {
  if (current !== next) payload[key] = next;
};

const buildPayload = (
  page: MemorialPage,
  form: MemorialPageFormState,
): MemorialPageUpdatePayload => {
  const payload: MemorialPageUpdatePayload = {};
  const nextPortraitImage = mediaPayloadValue(form.portraitImageId);
  const nextHeroImage = mediaPayloadValue(form.heroImageId);

  assignIfChanged(payload, 'full_name', page.full_name, form.fullName.trim());
  assignIfChanged(payload, 'slug', page.slug, form.slug.trim());
  assignIfChanged(payload, 'role_title', textValue(page.role_title), form.roleTitle.trim());
  assignIfChanged(payload, 'years_of_service', textValue(page.years_of_service), form.yearsOfService.trim());
  assignIfChanged(payload, 'birth_date', page.birth_date ?? null, datePayloadValue(form.birthDate));
  assignIfChanged(payload, 'death_date', page.death_date ?? null, datePayloadValue(form.deathDate));
  assignIfChanged(payload, 'summary', textValue(page.summary), form.summary.trim());
  assignIfChanged(payload, 'meta_title', textValue(page.meta_title), form.metaTitle.trim());
  assignIfChanged(payload, 'meta_description', textValue(page.meta_description), form.metaDescription.trim());
  assignIfChanged(payload, 'status', page.status, form.status);
  assignIfChanged(payload, 'is_visible', Boolean(page.is_visible), form.isVisible);
  assignIfChanged(payload, 'is_featured', Boolean(page.is_featured), form.isFeatured);

  if (!sameId(readMediaId(page.portrait_image, page.portrait_image_detail), nextPortraitImage)) {
    payload.portrait_image = nextPortraitImage;
  }
  if (!sameId(readMediaId(page.hero_image, page.hero_image_detail), nextHeroImage)) {
    payload.hero_image = nextHeroImage;
  }

  return payload;
};

const MemorialPageSettingsPanel = ({
  onPageUpdated,
  page,
}: MemorialPageSettingsPanelProps) => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const toast = usePortalToast();
  const [form, setForm] = useState<MemorialPageFormState>(() => formFromPage(page));
  const [heroAsset, setHeroAsset] = useState<MediaAsset | null>(() =>
    normalizeMediaAssetForDisplay(page.hero_image_detail),
  );
  const [portraitAsset, setPortraitAsset] = useState<MediaAsset | null>(() =>
    normalizeMediaAssetForDisplay(page.portrait_image_detail),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(formFromPage(page));
    setHeroAsset(normalizeMediaAssetForDisplay(page.hero_image_detail));
    setPortraitAsset(normalizeMediaAssetForDisplay(page.portrait_image_detail));
  }, [page]);

  const fieldClass = darkMode
    ? 'w-full rounded-2xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-stone-100 outline-none focus:ring-2 focus:ring-red-800/30'
    : 'w-full rounded-2xl border border-[#eaded0] bg-white px-4 py-3 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30';
  const mutedTextClass = portalSurface.softMutedText(darkMode);
  const canUpload = useMemo(() => canUploadMedia(auth.permissions), [auth.permissions]);

  const updateField = <Key extends keyof MemorialPageFormState>(
    key: Key,
    value: MemorialPageFormState[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const savePageShell = async () => {
    if (!form.fullName.trim() || !form.slug.trim()) {
      toast.error('Full name and slug are required before saving the memorial page shell.');
      return;
    }

    const payload = buildPayload(page, form);
    if (!Object.keys(payload).length) {
      toast.info('No memorial page shell changes to save.');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateMemorialPage(auth.accessToken, page.id, payload);
      onPageUpdated(updated);
      toast.success('Memorial page shell saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save memorial page shell.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      aria-label="Memorial page settings"
      className={`rounded-[1.5rem] border p-4 shadow-lg sm:rounded-3xl sm:p-5 ${portalSurface.panel(darkMode)}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-100">
            Page shell CRUD
          </p>
          <h2 className="mt-2 font-serif text-2xl leading-tight sm:text-3xl">Memorial identity</h2>
          <p className={`mt-2 max-w-3xl text-sm leading-6 ${mutedTextClass}`}>
            Maintain the memorial page shell before section-level editing begins.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <MemorialWorkflowControls
            darkMode={darkMode}
            disabled={saving}
            onRecordUpdated={(updated) => {
              onPageUpdated(updated);
              setForm(formFromPage(updated));
            }}
            record={page}
            resource="pages"
          />
          <button
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-red-800 px-5 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            disabled={saving}
            onClick={() => void savePageShell()}
            type="button"
          >
            <Save size={16} aria-hidden="true" />
            {saving ? 'Saving...' : 'Save shell'}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Full name
          <input
            className={fieldClass}
            maxLength={140}
            onChange={(event) => updateField('fullName', event.target.value)}
            value={form.fullName}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Slug
          <input
            className={fieldClass}
            maxLength={160}
            onChange={(event) => updateField('slug', event.target.value)}
            value={form.slug}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Role title
          <input
            className={fieldClass}
            maxLength={140}
            onChange={(event) => updateField('roleTitle', event.target.value)}
            value={form.roleTitle}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Years of service
          <input
            className={fieldClass}
            maxLength={80}
            onChange={(event) => updateField('yearsOfService', event.target.value)}
            placeholder="1988 - 2026"
            value={form.yearsOfService}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Birth date
          <input
            className={fieldClass}
            onChange={(event) => updateField('birthDate', event.target.value)}
            type="date"
            value={form.birthDate}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Death date
          <input
            className={fieldClass}
            onChange={(event) => updateField('deathDate', event.target.value)}
            type="date"
            value={form.deathDate}
          />
        </label>
      </div>

      <label className="mt-5 grid gap-2 text-sm font-bold">
        Summary
        <textarea
          className={`${fieldClass} min-h-28 resize-y`}
          maxLength={600}
          onChange={(event) => updateField('summary', event.target.value)}
          value={form.summary}
        />
        <span className={`text-xs font-normal ${mutedTextClass}`}>
          A short introduction used in cards, headers, and future public previews.
        </span>
      </label>

      <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 lg:grid-cols-2">
        <CoverImagePicker
          accessToken={auth.accessToken}
          canUpload={canUpload}
          darkMode={darkMode}
          disabled={saving}
          emptyText="Choose or upload the primary portrait image for this memorial."
          label="Portrait image"
          onChange={(asset) => {
            setPortraitAsset(asset);
            updateField('portraitImageId', asset ? String(asset.id) : '');
          }}
          selectedAsset={portraitAsset}
          selectedAssetId={form.portraitImageId}
          selectedText="A portrait image is selected for this memorial."
        />
        <CoverImagePicker
          accessToken={auth.accessToken}
          canUpload={canUpload}
          darkMode={darkMode}
          disabled={saving}
          emptyText="Choose or upload the wide hero image for the memorial page."
          label="Hero image"
          onChange={(asset) => {
            setHeroAsset(asset);
            updateField('heroImageId', asset ? String(asset.id) : '');
          }}
          selectedAsset={heroAsset}
          selectedAssetId={form.heroImageId}
          selectedText="A hero image is selected for this memorial."
        />
      </div>

      <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          SEO title
          <input
            className={fieldClass}
            maxLength={160}
            onChange={(event) => updateField('metaTitle', event.target.value)}
            value={form.metaTitle}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          SEO description
          <textarea
            className={`${fieldClass} min-h-24 resize-y`}
            maxLength={240}
            onChange={(event) => updateField('metaDescription', event.target.value)}
            value={form.metaDescription}
          />
        </label>
      </div>

      <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="grid gap-2 text-sm font-bold">
          Status
          <select
            className={fieldClass}
            onChange={(event) => updateField('status', event.target.value as MemorialWorkflowStatus)}
            value={form.status}
          >
            {MEMORIAL_WORKFLOW_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getMemorialStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 rounded-2xl border border-red-900/10 bg-red-950/[0.03] p-4 dark:border-red-200/10 dark:bg-white/[0.04]">
          <label className="flex items-center gap-3 text-sm font-bold">
            <input
              checked={form.isVisible}
              className="size-4 accent-red-800"
              onChange={(event) => updateField('isVisible', event.target.checked)}
              type="checkbox"
            />
            Visible on public memorial page
          </label>
          <label className="flex items-center gap-3 text-sm font-bold">
            <input
              checked={form.isFeatured}
              className="size-4 accent-red-800"
              onChange={(event) => updateField('isFeatured', event.target.checked)}
              type="checkbox"
            />
            Featured memorial
          </label>
        </div>
      </div>
    </section>
  );
};

export default MemorialPageSettingsPanel;
