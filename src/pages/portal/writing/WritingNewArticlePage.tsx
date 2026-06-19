import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { createWriting, fetchResourceTypes } from '../../../services/writingApi';
import type { WritingResourceType } from '../../../types/writing';
import { canCreateWriting } from '../../../utils/permissions';

const emptyLexicalDocument = { root: { children: [], type: 'root' } };
const defaultTypes = ['Devotional', 'Bible Study', 'Pastoral Letter', 'Guide', 'Ministry Charter'];

const WritingNewArticlePage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [error, setError] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [resourceTypes, setResourceTypes] = useState<WritingResourceType[]>([]);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchResourceTypes(auth.accessToken, controller.signal)
      .then((page) => setResourceTypes(page.results))
      .catch(() => setResourceTypes([]));
    return () => controller.abort();
  }, [auth.accessToken]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canCreateWriting(auth.permissions)) return;
    setSaving(true);
    setError('');

    try {
      const writing = await createWriting(auth.accessToken, {
        content: emptyLexicalDocument,
        excerpt,
        resource_type: resourceType || undefined,
        status: 'DRAFT',
        title: title || 'Untitled resource',
      });
      navigate(`/portal/writing/${writing.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create draft.');
    } finally {
      setSaving(false);
    }
  };

  const typeOptions = resourceTypes.length ? resourceTypes : defaultTypes.map((name) => ({ id: name, name, slug: name.toLowerCase().replaceAll(' ', '-') }));

  return (
    <WritingStudioShell>
      <form onSubmit={handleSubmit} className={`mx-auto max-w-3xl rounded-3xl border p-6 shadow-lg ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`}>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">New Article</p>
        <h2 className="mt-3 font-serif text-4xl">Begin a Library resource</h2>
        <div className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-bold">
            Title
            <input className={`rounded-2xl border px-4 py-3 font-normal outline-none ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-[#f8f5ef]'}`} onChange={(event) => setTitle(event.target.value)} value={title} />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Resource type
            <select className={`rounded-2xl border px-4 py-3 font-normal outline-none ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`} onChange={(event) => setResourceType(event.target.value)} value={resourceType}>
              <option value="">Choose type</option>
              {typeOptions.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Excerpt
            <textarea className={`min-h-28 rounded-2xl border px-4 py-3 font-normal outline-none ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-[#f8f5ef]'}`} onChange={(event) => setExcerpt(event.target.value)} value={excerpt} />
          </label>
        </div>
        {error ? <p className="mt-5 rounded-2xl bg-red-950/5 p-4 text-sm font-bold text-red-800">{error}</p> : null}
        <button className="mt-8 rounded-full bg-red-800 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-60" disabled={saving || !canCreateWriting(auth.permissions)} type="submit">
          {saving ? 'Creating...' : 'Create draft'}
        </button>
      </form>
    </WritingStudioShell>
  );
};

export default WritingNewArticlePage;
