import { useCallback, useEffect, useState } from 'react';
import { HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteFooter from '../../../components/navigation/SiteFooter';
import SiteHeader from '../../../components/navigation/SiteHeader';
import { portalSurface } from '../../../components/portal/portalSurface';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { fetchPortalMemorials } from './api/memorialPortalApi';
import { getMemorialPortalRoutes } from './config';
import type { PortalMemorialSummary } from './types';
import { formatMemorialDateTime, statusLabel } from './utils/presentation';

const MemorialDiscoveryPage = () => {
  const { accessToken } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [memorials, setMemorials] = useState<PortalMemorialSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      setMemorials((await fetchPortalMemorials(accessToken)).memorials);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Memorials could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className={`flex min-h-screen flex-col ${portalSurface.page(darkMode)}`}>
      <SiteHeader darkMode={darkMode} onToggleTheme={toggleTheme} />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-200">Portal</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Memorials</h1>
          <p className={`mt-3 max-w-2xl text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>Choose a memorial supplied by the church backend to write, review, approve, or publish.</p>

          {loading ? <p className="py-12 text-sm font-bold" role="status">Loading available memorials...</p> : null}
          {error ? <div className="mt-8 rounded-2xl border border-red-800/30 bg-red-950/10 p-5 text-sm font-bold" role="alert">{error} <button className="underline" onClick={() => void load()} type="button">Try again</button></div> : null}
          {!loading && !error && memorials.length === 0 ? (
            <section className={`mt-8 rounded-3xl border p-8 ${portalSurface.card(darkMode)}`}>
              <HeartHandshake className="text-red-800 dark:text-red-200" size={28} />
              <h2 className="mt-4 font-serif text-3xl">No memorials are available yet</h2>
              <p className={`mt-3 max-w-xl text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>Once a memorial page is created in the backend, it will appear here automatically. No slug or memorial ID needs to be entered in the frontend.</p>
            </section>
          ) : null}
          {!loading && !error && memorials.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {memorials.map((memorial) => (
                <Link className={`group rounded-3xl border p-6 shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 ${portalSurface.card(darkMode)}`} key={memorial.id} to={getMemorialPortalRoutes(memorial.slug).overview}>
                  <div className="flex items-start justify-between gap-4"><HeartHandshake className="text-red-800 dark:text-red-200" size={23} /><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-700 dark:bg-white/10 dark:text-stone-200">{statusLabel(memorial.status)}</span></div>
                  <h2 className="mt-5 font-serif text-2xl">{memorial.display_name}</h2>
                  <p className={`mt-2 text-xs ${portalSurface.softMutedText(darkMode)}`}>Updated {formatMemorialDateTime(memorial.updated_at)}</p>
                  <span className="mt-5 inline-flex text-sm font-black text-red-800 dark:text-red-200">Open memorial &rarr;</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default MemorialDiscoveryPage;
