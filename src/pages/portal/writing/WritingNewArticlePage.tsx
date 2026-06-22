import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArticleEditor from '../../../components/portal/writing/editor/ArticleEditor';
import { createEmptyLexicalContent, type LexicalContentJson } from '../../../components/portal/writing/editor/serialization';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { fetchResourcesNavigation } from '../../../services/resourcesApi';
import { createWriting, fetchResourceTypes } from '../../../services/writingApi';
import type { WritingCategory, WritingResourceType } from '../../../types/writing';
import { canCreateWriting } from '../../../utils/permissions';

const defaultTypes = ['Devotional', 'Bible Study', 'Pastoral Letter', 'Guide', 'Ministry Charter'];

const WritingNewArticlePage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<WritingCategory[]>([]);
  const [contentJson, setContentJson] = useState<LexicalContentJson>(() => createEmptyLexicalContent());
  const [error, setError] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [resourceTypes, setResourceTypes] = useState<WritingResourceType[]>([]);
  const [saving, setSaving] = useState(false);
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);
  const [title, setTitle] = useState('');

  const surfaceClass = darkMode
    ? 'rounded-3xl border border-white/10 bg-zinc-950 p-5 shadow-lg shadow-black/25'
    : 'rounded-3xl border border-black/10 bg-white p-5 shadow-lg shadow-zinc-900/5';
  const fieldClass = darkMode
    ? 'w-full rounded-2xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-stone-100 outline-none focus:ring-2 focus:ring-red-800/30'
    : 'w-full rounded-2xl border border-black/10 bg-[#fffaf0] px-4 py-3 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30';
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
      setCategory('');
      return;
    }

    const controller = new AbortController();
    setTaxonomyLoading(true);
    setCategory('');
    fetchResourcesNavigation({ resource_type_slug: selectedType.slug }, controller.signal)
      .then((navigation) => setCategories(navigation.categories))
      .catch(() => {
        if (!controller.signal.aborted) setCategories([]);
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
        content_json: contentJson,
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

  const intro = (
    <div className="max-w-4xl">
      <Link className={darkMode ? 'inline-flex text-sm font-bold text-red-300 transition hover:text-red-100' : 'inline-flex text-sm font-bold text-red-800 transition hover:text-red-700'} to="/portal/writing/articles">
        Back to Articles
      </Link>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-red-800">New Article</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Write a New Article</h1>
      <p className={'mt-4 max-w-2xl leading-7 ' + mutedTextClass}>
        Give this resource a clear title, then begin shaping the message for the church community.
      </p>
    </div>
  );

  return (
    <WritingStudioShell intro={intro}>
      <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]" onSubmit={handleSubmit}>
        <section className="min-w-0">
          <label className="mb-4 grid gap-2 text-sm font-bold">
            Working title
            <input autoFocus className={fieldClass} maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="Give this resource a clear, pastoral title" required value={title} />
          </label>
          <ArticleEditor contentJson={contentJson} darkMode={darkMode} onChange={(nextContent) => setContentJson(nextContent)} saveState="idle" />
        </section>

        <aside className={'self-start ' + surfaceClass}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Document Settings</p>
          <div className="mt-5 grid gap-5">
            <label className="grid gap-2 text-sm font-bold">
              Status
              <select className={fieldClass} disabled value="DRAFT"><option value="DRAFT">Draft</option></select>
              <span className={'text-xs font-normal ' + mutedTextClass}>This article is only visible to editors.</span>
            </label>
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
            <label className="grid gap-2 text-sm font-bold">
              Public excerpt <span className={'font-normal ' + mutedTextClass}>(optional)</span>
              <textarea className={fieldClass + ' min-h-28 resize-y leading-6'} maxLength={320} onChange={(event) => setExcerpt(event.target.value)} placeholder="A short invitation to read this resource." value={excerpt} />
            </label>
          </div>

          {error ? <p className="mt-5 rounded-2xl bg-red-950/5 p-4 text-sm font-bold text-red-800">{error}</p> : null}

          <div className={'mt-6 border-t pt-5 ' + (darkMode ? 'border-white/10' : 'border-black/10')}>
            <button className="w-full rounded-full bg-red-800 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-60" disabled={saving || !canCreateWriting(auth.permissions)} type="submit">
              {saving ? 'Creating draft...' : 'Create draft'}
            </button>
          </div>
        </aside>
      </form>
    </WritingStudioShell>
  );
};

export default WritingNewArticlePage;