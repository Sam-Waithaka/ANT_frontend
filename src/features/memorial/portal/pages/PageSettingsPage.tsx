import { useEffect, useState, type FormEvent } from 'react';
import { useTheme } from '../../../../hooks/useTheme';
import { useAuth } from '../../../../hooks/useAuth';
import { usePortalToast } from '../../../../components/portal/PortalToast';
import { portalSurface } from '../../../../components/portal/portalSurface';
import { updateMemorialPage } from '../api/memorialPortalApi';
import { useMemorialPortal } from '../hooks/useMemorialPortal';
import type { ModerationPage, PageUpdatePayload } from '../types';
import { MemorialButton, MemorialCard, MemorialError, MemorialField, MemorialTextarea } from '../components/MemorialUi';

const textFields: Array<{ key: keyof PageUpdatePayload; label: string; multiline?: boolean; type?: string }> = [
  { key: 'display_name', label: 'Display name' },
  { key: 'role', label: 'Church role' },
  { key: 'church_name', label: 'Church name' },
  { key: 'service_summary', label: 'Service summary', multiline: true },
  { key: 'birth_date', label: 'Birth date', type: 'date' },
  { key: 'death_date', label: 'Death date', type: 'date' },
  { key: 'lcc_statement_attribution', label: 'LCC statement attribution' },
  { key: 'lcc_statement_issued_on', label: 'Statement issue date', type: 'date' },
  { key: 'ministry_tributes_intro', label: 'Ministry tributes introduction', multiline: true },
  { key: 'personal_reflections_intro', label: 'Personal reflections introduction', multiline: true },
  { key: 'leadership_timeline_intro', label: 'Leadership timeline introduction', multiline: true },
  { key: 'gallery_intro', label: 'Gallery introduction', multiline: true },
  { key: 'recordings_intro', label: 'Recordings introduction', multiline: true },
  { key: 'scripture_text', label: 'Scripture text', multiline: true },
  { key: 'scripture_reference', label: 'Scripture reference' },
  { key: 'scripture_translation', label: 'Scripture translation' },
  { key: 'scripture_attribution', label: 'Scripture attribution' },
  { key: 'seo_title', label: 'SEO title' },
  { key: 'seo_description', label: 'SEO description', multiline: true },
];

const sections: Array<{ enabled: keyof ModerationPage; heading: keyof ModerationPage; label: string }> = [
  { enabled: 'hero_enabled', heading: 'hero_heading', label: 'Memorial hero and identity' },
  { enabled: 'lcc_statement_enabled', heading: 'lcc_statement_heading', label: 'Official LCC statement' },
  { enabled: 'life_and_service_enabled', heading: 'life_and_service_heading', label: 'His life and faithful service' },
  { enabled: 'ministry_tributes_enabled', heading: 'ministry_tributes_heading', label: 'Ministry tributes' },
  { enabled: 'personal_reflections_enabled', heading: 'personal_reflections_heading', label: 'Personal reflections' },
  { enabled: 'leadership_timeline_enabled', heading: 'leadership_timeline_heading', label: 'Leadership timeline' },
  { enabled: 'gallery_enabled', heading: 'gallery_heading', label: 'Gallery' },
  { enabled: 'recordings_enabled', heading: 'recordings_heading', label: 'Recordings' },
  { enabled: 'arrangements_enabled', heading: 'arrangements_heading', label: 'Arrangements' },
  { enabled: 'family_enabled', heading: 'family_heading', label: 'Family' },
  { enabled: 'closing_hope_enabled', heading: 'closing_hope_heading', label: 'Closing hope' },
];

const PageSettingsPage = () => {
  const { darkMode } = useTheme();
  const { accessToken } = useAuth();
  const toast = usePortalToast();
  const { moderation, setModeration, slug } = useMemorialPortal();
  const [form, setForm] = useState<ModerationPage | null>(moderation?.page ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setForm(moderation?.page ?? null), [moderation?.page]);
  if (!moderation || !form) return <MemorialError>Moderation access is required to configure the memorial page.</MemorialError>;
  const editable = moderation.page.status !== 'published' && moderation.capabilities.page.change;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editable) return;
    setSaving(true);
    setError('');
    const readOnly = new Set(['id', 'slug', 'status', 'published_at', 'published_by', 'created_at', 'updated_at']);
    const body = Object.fromEntries(Object.entries(form).filter(([key]) => !readOnly.has(key))) as PageUpdatePayload;
    body.expected_updated_at = moderation.page.updated_at;
    try {
      const workspace = await updateMemorialPage(accessToken, slug, body);
      setModeration(workspace);
      toast.success('Memorial page settings saved.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save page settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="grid gap-6" onSubmit={submit}>
      {!editable ? <MemorialError>{moderation.page.status === 'published' ? 'Published memorials are locked. Unpublish before changing page settings.' : 'You have read-only access to this page.'}</MemorialError> : null}
      {error ? <MemorialError>{error}</MemorialError> : null}
      <MemorialCard darkMode={darkMode}>
        <h2 className="font-serif text-3xl">Identity and presentation</h2>
        <p className={`mt-2 text-sm ${portalSurface.softMutedText(darkMode)}`}>These are memorial-owned snapshots. Lexical narrative bodies stay in Writing.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {textFields.slice(0, 6).map((field) => {
            const fieldValue = form[field.key as keyof ModerationPage];
            const props = { disabled: !editable, label: field.label, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((current) => current ? ({ ...current, [field.key]: event.target.value || (field.type === 'date' ? null : '') }) : current), value: typeof fieldValue === 'string' ? fieldValue : '' };
            return field.multiline ? <MemorialTextarea key={field.key} {...props} /> : <MemorialField key={field.key} type={field.type} {...props} />;
          })}
        </div>
      </MemorialCard>

      <MemorialCard darkMode={darkMode}>
        <h2 className="font-serif text-3xl">Sections</h2>
        <p className={`mt-2 text-sm ${portalSurface.softMutedText(darkMode)}`}>Top-level order is fixed. Configure the heading and whether each section is eligible to appear.</p>
        <div className="mt-6 grid gap-3">
          {sections.map((section, index) => (
            <div className={`grid gap-3 rounded-2xl border p-4 md:grid-cols-[3rem_minmax(0,1fr)_auto] md:items-center ${portalSurface.mutedSurface(darkMode)}`} key={section.enabled}>
              <span className="font-serif text-2xl text-red-800 dark:text-red-200">{index + 1}</span>
              <label className="grid gap-1 text-sm font-bold"><span>{section.label}</span><input className={`min-h-11 rounded-xl border px-3 ${portalSurface.input(darkMode)}`} disabled={!editable} onChange={(event) => setForm((current) => current ? ({ ...current, [section.heading]: event.target.value }) : current)} value={String(form[section.heading] ?? '')} /></label>
              <label className="inline-flex min-h-11 items-center gap-3 text-sm font-black"><input checked={Boolean(form[section.enabled])} className="size-5 accent-red-800" disabled={!editable} onChange={(event) => setForm((current) => current ? ({ ...current, [section.enabled]: event.target.checked }) : current)} type="checkbox" /> Enabled</label>
            </div>
          ))}
        </div>
      </MemorialCard>

      <MemorialCard darkMode={darkMode}>
        <h2 className="font-serif text-3xl">Introductions, Scripture and SEO</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {textFields.slice(6).map((field) => {
            const fieldValue = form[field.key as keyof ModerationPage];
            const props = { disabled: !editable, label: field.label, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((current) => current ? ({ ...current, [field.key]: event.target.value || (field.type === 'date' ? null : '') }) : current), value: typeof fieldValue === 'string' ? fieldValue : '' };
            return field.multiline ? <MemorialTextarea key={field.key} {...props} /> : <MemorialField key={field.key} type={field.type} {...props} />;
          })}
        </div>
      </MemorialCard>
      <div className="sticky bottom-4 flex justify-end"><MemorialButton disabled={!editable || saving} type="submit">{saving ? 'Saving...' : 'Save page settings'}</MemorialButton></div>
    </form>
  );
};

export default PageSettingsPage;
