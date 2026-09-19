import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArticleEditor from '../../../../components/portal/writing/editor/ArticleEditor';
import type { EditorSaveState } from '../../../../components/portal/writing/editor/EditorStatus';
import { usePortalToast } from '../../../../components/portal/PortalToast';
import { portalSurface } from '../../../../components/portal/portalSurface';
import { useAuth } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';
import { createMemorialTribute, isStaleMemorialError, updateRepeatedWriteup, updateSingletonWriteup } from '../api/memorialPortalApi';
import { MemorialButton, MemorialCard, MemorialError, MemorialField } from '../components/MemorialUi';
import { useMemorialPortal } from '../hooks/useMemorialPortal';
import type { LexicalJson, PortalWriteup, WriteupType } from '../types';
import { emptyContent } from '../utils/presentation';

const keyFor = (item: PortalWriteup) => `${item.writeup_type}:${item.object_id ?? 'singleton'}`;

const WritingPage = () => {
  const { darkMode } = useTheme();
  const { accessToken } = useAuth();
  const toast = usePortalToast();
  const { refreshWriteups, slug, writeups } = useMemorialPortal();
  const [params, setParams] = useSearchParams();
  const requested = params.get('writeup');
  const [selectedKey, setSelectedKey] = useState(requested ?? '');
  const selected = useMemo(() => writeups?.writeups.find((item) => keyFor(item) === selectedKey) ?? writeups?.writeups[0] ?? null, [selectedKey, writeups]);
  const [content, setContent] = useState<LexicalJson>({});
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<EditorSaveState>('idle');
  const [error, setError] = useState('');
  const [stale, setStale] = useState(false);
  const [creatingContribution, setCreatingContribution] = useState(false);
  const [contributionKind, setContributionKind] = useState<'ministry' | 'personal'>('ministry');

  useEffect(() => {
    if (!selected) return;
    if (!selectedKey) setSelectedKey(keyFor(selected));
    if (!dirty) setContent(selected.content_json);
  }, [dirty, selected, selectedKey]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!writeups || !selected) return <MemorialError>The backend returned no editable writeups for this memorial.</MemorialError>;
  const editable = writeups.editable;

  const changeSelection = (value: string) => {
    if (dirty && !window.confirm('Discard your unsaved memorial writing and open another document?')) return;
    setSelectedKey(value);
    setParams({ writeup: value });
    setDirty(false);
    setError('');
    setStale(false);
  };

  const save = async () => {
    if (!editable) return;
    setSaveState('saving');
    setError('');
    try {
      if (selected.object_id) {
        await updateRepeatedWriteup(accessToken, slug, selected.writeup_type as Extract<WriteupType, 'tribute' | 'milestone' | 'service_event'>, selected.object_id, { content_json: content, expected_updated_at: selected.updated_at });
      } else {
        await updateSingletonWriteup(accessToken, slug, selected.writeup_type as Exclude<WriteupType, 'tribute' | 'milestone' | 'service_event'>, content, selected.updated_at);
      }
      await refreshWriteups();
      setDirty(false);
      setStale(false);
      setSaveState('saved');
      toast.success('Draft saved. Approval and publication are unchanged.');
    } catch (requestError) {
      setSaveState('error');
      setStale(isStaleMemorialError(requestError));
      setError(requestError instanceof Error ? requestError.message : 'Unable to save this draft.');
      if (isStaleMemorialError(requestError)) await refreshWriteups();
    }
  };

  const createContribution = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const kind = String(data.get('kind')) as 'ministry' | 'personal';
    setCreatingContribution(true);
    setError('');
    try {
      const created = await createMemorialTribute(accessToken, slug, {
        author_name: String(data.get('author_name') ?? ''),
        author_role: String(data.get('author_role') ?? ''),
        content_json: emptyContent,
        expected_page_updated_at: writeups.updated_at,
        kind,
        ministry_name: kind === 'ministry' ? String(data.get('ministry_name') ?? '') : '',
      });
      await refreshWriteups();
      const nextKey = keyFor(created);
      setSelectedKey(nextKey);
      setParams({ writeup: nextKey });
      setContent(created.content_json);
      setDirty(false);
      form.reset();
      toast.success('Contribution saved and awaiting approval. Continue writing below.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create this contribution.');
    } finally {
      setCreatingContribution(false);
    }
  };

  return (
    <div className="grid gap-6">
      {!editable ? <MemorialError>Published memorials are read-only. An authorized publisher must unpublish before editing.</MemorialError> : null}
      {error ? <MemorialError>{stale ? 'Another editor saved a newer version. Your local draft is still here. Review it before retrying. ' : ''}{error}</MemorialError> : null}
      {editable ? <MemorialCard darkMode={darkMode}>
        <details>
          <summary className="cursor-pointer text-sm font-black text-red-800 dark:text-red-200">Submit a new commissioned tribute or reflection</summary>
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={createContribution}>
            <label className="grid gap-2 text-sm font-bold"><span>Contribution type</span><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} name="kind" onChange={(event) => setContributionKind(event.target.value as 'ministry' | 'personal')} value={contributionKind}><option value="ministry">Ministry tribute</option><option value="personal">Personal reflection</option></select></label>
            {contributionKind === 'ministry' ? <MemorialField hint="Required for a commissioned ministry tribute." label="Ministry name" name="ministry_name" required /> : <div className={`rounded-2xl border p-4 text-sm ${portalSurface.mutedSurface(darkMode)}`}>Personal reflections do not carry a ministry name.</div>}
            <MemorialField label="Author name" name="author_name" required />
            <MemorialField label="Author role" name="author_role" />
            <div><MemorialButton disabled={creatingContribution} type="submit">{creatingContribution ? 'Creating...' : 'Create and start writing'}</MemorialButton></div>
          </form>
        </details>
      </MemorialCard> : null}
      <MemorialCard darkMode={darkMode}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <label className="grid flex-1 gap-2 text-sm font-bold"><span>Memorial document</span><select className={`min-h-12 rounded-2xl border px-4 ${portalSurface.input(darkMode)}`} onChange={(event) => changeSelection(event.target.value)} value={keyFor(selected)}>{writeups.writeups.map((item) => <option key={keyFor(item)} value={keyFor(item)}>{item.label}</option>)}</select></label>
          <div className="flex flex-wrap gap-2">
            {stale ? <MemorialButton onClick={() => void navigator.clipboard?.writeText(JSON.stringify(content, null, 2))} tone="secondary" type="button">Copy local draft</MemorialButton> : null}
            <MemorialButton disabled={!editable || !dirty || saveState === 'saving'} onClick={() => void save()} type="button">{saveState === 'saving' ? 'Saving...' : 'Save draft'}</MemorialButton>
          </div>
        </div>
        <p className={`mt-3 text-xs ${portalSurface.softMutedText(darkMode)}`}>Server version: {selected.updated_at}. Saving never approves or publishes.</p>
      </MemorialCard>
      <ArticleEditor
        contentJson={content}
        darkMode={darkMode}
        editable={editable}
        key={`${keyFor(selected)}:${selected.updated_at}`}
        mediaDisabledLabel="Memorial media is managed in the Media workspace."
        onChange={(next) => { setContent(next); setDirty(true); setSaveState('idle'); }}
        saveState={saveState}
      />
    </div>
  );
};

export default WritingPage;
