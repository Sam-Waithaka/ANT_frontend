import { useEffect, useState } from 'react';
import WritingArticleCard from '../../../components/portal/writing/WritingArticleCard';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { fetchWritings } from '../../../services/writingApi';
import type { Writing, WritingStatus } from '../../../types/writing';
import { canEditAnyWriting, canPublishWriting, canViewAnyDrafts } from '../../../utils/permissions';

const sections: Array<{ status?: WritingStatus; title: string; featured?: boolean }> = [
  { status: 'IN_REVIEW', title: 'Needs Review' },
  { status: 'SCHEDULED', title: 'Scheduled' },
  { featured: true, title: 'Featured' },
  { status: 'PUBLISHED', title: 'Recently Published' },
  { status: 'DRAFT', title: 'Author Drafts' },
];

const WritingEditorialPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [data, setData] = useState<Record<string, Writing[]>>({});
  const [message, setMessage] = useState('');
  const allowed = canViewAnyDrafts(auth.permissions) || canEditAnyWriting(auth.permissions) || canPublishWriting(auth.permissions);

  useEffect(() => {
    if (!allowed) return;
    const controller = new AbortController();

    Promise.all(
      sections.map((section) =>
        fetchWritings(auth.accessToken, { featured: section.featured, page_size: 6, status: section.status }, controller.signal)
          .then((page) => [section.title, page.results] as const),
      ),
    )
      .then((entries) => setData(Object.fromEntries(entries)))
      .catch(() => setMessage('Unable to load editorial queues right now.'));

    return () => controller.abort();
  }, [allowed, auth.accessToken]);

  return (
    <WritingStudioShell>
      {!allowed ? (
        <p className="rounded-3xl border border-red-900/10 bg-red-950/5 p-6 font-bold text-red-800">Editorial review requires draft review or publishing permission.</p>
      ) : null}
      {message ? <p className="mb-6 rounded-2xl bg-red-950/5 p-4 text-sm font-bold text-red-800">{message}</p> : null}
      <div className="grid gap-8">
        {sections.map((section) => (
          <section key={section.title}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-red-800">{section.title}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(data[section.title] || []).map((writing) => <WritingArticleCard key={writing.id} darkMode={darkMode} writing={writing} />)}
            </div>
            {allowed && (data[section.title] || []).length === 0 ? (
              <p className={`rounded-3xl border p-6 text-sm ${darkMode ? 'border-white/10 bg-zinc-950 text-stone-400' : 'border-black/10 bg-white text-zinc-600'}`}>
                Nothing in this queue yet.
              </p>
            ) : null}
          </section>
        ))}
      </div>
    </WritingStudioShell>
  );
};

export default WritingEditorialPage;
