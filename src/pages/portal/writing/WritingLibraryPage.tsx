import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { createCategory, createResourceType, createSeries, fetchCategories, fetchResourceTypes, fetchSeries } from '../../../services/writingApi';
import type { WritingCategory, WritingResourceType, WritingSeries } from '../../../types/writing';
import { canManageTaxonomy } from '../../../utils/permissions';

type TaxonomyKind = 'category' | 'resourceType' | 'series';

const WritingLibraryPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [categories, setCategories] = useState<WritingCategory[]>([]);
  const [resourceTypes, setResourceTypes] = useState<WritingResourceType[]>([]);
  const [series, setSeries] = useState<WritingSeries[]>([]);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [kind, setKind] = useState<TaxonomyKind>('category');

  const load = () => {
    const controller = new AbortController();
    Promise.all([
      fetchResourceTypes(auth.accessToken, controller.signal),
      fetchCategories(auth.accessToken, controller.signal),
      fetchSeries(auth.accessToken, controller.signal),
    ])
      .then(([types, nextCategories, nextSeries]) => {
        setResourceTypes(types.results);
        setCategories(nextCategories.results);
        setSeries(nextSeries.results);
      })
      .catch(() => setMessage('Unable to load Library taxonomy right now.'));
    return controller;
  };

  useEffect(() => {
    const controller = load();
    return () => controller.abort();
  }, [auth.accessToken]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !canManageTaxonomy(auth.permissions)) return;
    const slug = name.toLowerCase().trim().replaceAll(' ', '-');
    try {
      if (kind === 'resourceType') await createResourceType(auth.accessToken, { name, slug });
      if (kind === 'category') await createCategory(auth.accessToken, { name, slug });
      if (kind === 'series') await createSeries(auth.accessToken, { slug, title: name });
      setName('');
      setMessage('Library item created.');
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to create Library item.');
    }
  };

  const panels = [
    { items: resourceTypes.map((item) => item.name), title: 'Resource Types' },
    { items: categories.map((item) => item.name), title: 'Categories' },
    { items: series.map((item) => item.title || item.name || item.slug), title: 'Collections' },
    { items: ['Tags placeholder'], title: 'Tags' },
  ];

  return (
    <WritingStudioShell>
      <div className="grid gap-6 xl:grid-cols-[24rem_1fr]">
        <form onSubmit={handleCreate} className={`rounded-3xl border p-6 shadow-lg ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Library</p>
          <h2 className="mt-3 font-serif text-4xl">Curate resource structure</h2>
          <select className={`mt-6 w-full rounded-2xl border px-4 py-3 ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`} onChange={(event) => setKind(event.target.value as TaxonomyKind)} value={kind}>
            <option value="category">Category</option>
            <option value="resourceType">Resource Type</option>
            <option value="series">Collection</option>
          </select>
          <input className={`mt-4 w-full rounded-2xl border px-4 py-3 outline-none ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-[#f8f5ef]'}`} onChange={(event) => setName(event.target.value)} placeholder="Name" value={name} />
          <button className="mt-5 rounded-full bg-red-800 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-50" disabled={!canManageTaxonomy(auth.permissions)} type="submit">Create</button>
          {message ? <p className="mt-5 text-sm font-bold text-red-800">{message}</p> : null}
        </form>
        <div className="grid gap-4 md:grid-cols-2">
          {panels.map((panel) => (
            <section key={panel.title} className={`rounded-3xl border p-5 shadow-lg ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`}>
              <h3 className="text-lg font-black">{panel.title}</h3>
              <div className="mt-4 grid gap-2">
                {panel.items.length ? panel.items.map((item) => <span key={item} className={`rounded-2xl px-4 py-3 text-sm ${darkMode ? 'bg-white/5 text-stone-300' : 'bg-[#f8f5ef] text-zinc-700'}`}>{item}</span>) : <span className="text-sm text-zinc-500">No items yet.</span>}
              </div>
            </section>
          ))}
        </div>
      </div>
    </WritingStudioShell>
  );
};

export default WritingLibraryPage;
