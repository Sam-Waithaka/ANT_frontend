import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { fetchResourcesNavigation } from '../../../services/resourcesApi';
import { createWriting, fetchResourceTypes } from '../../../services/writingApi';
import type { WritingCategory, WritingResourceType, WritingSeries } from '../../../types/writing';
import { canCreateWriting } from '../../../utils/permissions';

const emptyLexicalDocument = { root: { children: [], type: 'root' } };
const defaultTypes = ['Devotional', 'Bible Study', 'Pastoral Letter', 'Guide', 'Ministry Charter'];

const WritingNewArticlePage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<WritingCategory[]>([]);
  const [error, setError] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [resourceTypes, setResourceTypes] = useState<WritingResourceType[]>([]);
  const [saving, setSaving] = useState(false);
  const [series, setSeries] = useState<WritingSeries[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);
  const [title, setTitle] = useState('');

  const cardClass = darkMode
    ? 'rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-lg shadow-black/25 sm:p-8'
    : 'rounded-3xl border border-black/10 bg-white p-6 shadow-lg shadow-zinc-900/5 sm:p-8';
  const fieldClass = darkMode
    ? 'rounded-2xl border border-white/10 bg-[#171717] px-4 py-3 font-normal text-stone-100 outline-none focus:ring-2 focus:ring-red-800/30'
    : 'rounded-2xl border border-black/10 bg-[#fffaf0] px-4 py-3 font-normal text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';

  useEffect(() => {
    const controller = new AbortController();
    fetchResourceTypes(auth.accessToken, controller.signal)
      .then((page) => setResourceTypes(page.results))
      .catch(() => setResourceTypes([]));
    return () => controller.abort();
  }, [auth.accessToken]);

  const typeOptions = useMemo(
    () => resourceTypes.length
      ? resourceTypes
      : defaultTypes.map((name) => ({ id: name, name, slug: name.toLowerCase().replaceAll(' ', '-') })),
    [resourceTypes],
  );

  const selectedType = typeOptions.find((type) => String(type.id) === resourceType);

  useEffect(() => {
    if (!selectedType?.slug) {
      setCategories([]);
      setSeries([]);
      setCategory('');
      return;
    }

    const controller = new AbortController();
    setTaxonomyLoading(true);
    setCategory('');

    fetchResourcesNavigation({ resource_type_slug: selectedType.slug }, controller.signal)
      .then((navigation) => {
        setCategories(navigation.categories);
        setSeries(navigation.series);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCategories([]);
          setSeries([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setTaxonomyLoading(false);
      });

    return () => controller.abort();
  }, [selectedType?.slug]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canCreateWriting(auth.permissions)) return;

    setSaving(true);
    setError('');

    try {
      const writing = await createWriting(auth.accessToken, {
        category_ids: category ? [category] : undefined,
        content_json: emptyLexicalDocument,
        excerpt,
        resource_type: resourceType,
        status: 'DRAFT',
        title: title.trim(),
      });
      navigate('/portal/writing/' + writing.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create draft.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <WritingStudioShell>
      <form className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]" onSubmit={handleSubmit}>
        <section className={cardClass}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">New Article</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight">Begin a Library resource</h2>
          <p className={'mt-4 max-w-2xl leading-7 ' + mutedTextClass}>
            Start with the essential editorial details. You can develop the full article, add media, and prepare it for review in the next step.
          </p>
          <div className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-bold">
              Working title
              <input autoFocus className={fieldClass} onChange={(event) => setTitle(event.target.value)} placeholder="Give this resource a clear, pastoral title" required value={title} />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold">
                Resource type
                <select className={fieldClass} onChange={(event) => setResourceType(event.target.value)} required value={resourceType}>
                  <option value="">Choose type</option>
                  {typeOptions.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Category <span className={'font-normal ' + mutedTextClass}>(optional)</span>
                <select className={fieldClass} disabled={!resourceType || taxonomyLoading || categories.length === 0} onChange={(event) => setCategory(event.target.value)} value={category}>
                  <option value="">{taxonomyLoading ? 'Loading categories...' : categories.length ? 'Choose category' : 'No curated categories yet'}</option>
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm font-bold">
              Public excerpt <span className={'font-normal ' + mutedTextClass}>(optional)</span>
              <textarea className={fieldClass + ' min-h-32 leading-7'} maxLength={320} onChange={(event) => setExcerpt(event.target.value)} placeholder="A short invitation to read this resource." value={excerpt} />
            </label>
          </div>
          {resourceType && series.length ? (
            <p className={'mt-5 border-t pt-5 text-sm leading-6 ' + (darkMode ? 'border-white/10 text-stone-400' : 'border-black/10 text-zinc-600')}>
              Available collections for this resource type: {series.map((item) => item.title || item.name || item.slug).join(', ')}.
            </p>
          ) : null}
          {error ? <p className="mt-5 rounded-2xl bg-red-950/5 p-4 text-sm font-bold text-red-800">{error}</p> : null}
          <button className="mt-8 w-full rounded-full bg-red-800 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-60 sm:w-auto" disabled={saving || !canCreateWriting(auth.permissions)} type="submit">
            {saving ? 'Creating draft...' : 'Create draft'}
          </button>
        </section>
        <aside className={cardClass}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Editorial Path</p>
          <ol className={'mt-5 grid gap-5 text-sm leading-6 ' + (darkMode ? 'text-stone-300' : 'text-zinc-700')}>
            <li><strong className={darkMode ? 'text-stone-100' : 'text-zinc-950'}>1. Create the draft</strong><br />Set its title and place in the Library.</li>
            <li><strong className={darkMode ? 'text-stone-100' : 'text-zinc-950'}>2. Write and refine</strong><br />Develop the article, excerpt, imagery, and metadata.</li>
            <li><strong className={darkMode ? 'text-stone-100' : 'text-zinc-950'}>3. Review and publish</strong><br />Send it through the appropriate editorial workflow.</li>
          </ol>
        </aside>
      </form>
    </WritingStudioShell>
  );
};

export default WritingNewArticlePage;