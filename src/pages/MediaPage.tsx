import { useEffect, useMemo, useState } from 'react';
import MediaCallout from '../components/media/MediaCallout';
import MediaCategoryTabs from '../components/media/MediaCategoryTabs';
import MediaFeatured from '../components/media/MediaFeatured';
import MediaHero from '../components/media/MediaHero';
import MediaRail from '../components/media/MediaRail';
import MediaSidebar from '../components/media/MediaSidebar';
import { fallbackMediaHome } from '../components/media/mediaContent';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useTheme } from '../hooks/useTheme';
import { fetchAudioVisualHome } from '../services/audioVisualApi';
import type { AudioVisualHomePayload } from '../types/audioVisual';

const MediaPage = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [homePayload, setHomePayload] = useState<AudioVisualHomePayload>(fallbackMediaHome);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');

  useEffect(() => {
    const controller = new AbortController();

    fetchAudioVisualHome(controller.signal)
      .then((payload) => {
        const hasContent = Boolean(payload.hero || payload.live || payload.rails.some((rail) => rail.items.length > 0));
        setHomePayload(hasContent ? payload : fallbackMediaHome);
        setStatus(hasContent ? 'ready' : 'fallback');
      })
      .catch(() => {
        setHomePayload(fallbackMediaHome);
        setStatus('fallback');
      });

    return () => controller.abort();
  }, []);

  const rails = useMemo(() => {
    const railMap = new Map(homePayload.rails.map((rail) => [rail.key, rail]));

    return {
      featured: railMap.get('featured') || homePayload.rails[0] || fallbackMediaHome.rails[0],
      series: railMap.get('series') || railMap.get('sermons') || fallbackMediaHome.rails[1],
      latest: railMap.get('latest') || fallbackMediaHome.rails[2],
      shorts: railMap.get('shorts') || railMap.get('highlights') || fallbackMediaHome.rails[3],
    };
  }, [homePayload.rails]);

  return (
    <div className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader activePath="/media" darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main className="flex-1 bg-[#050505] text-stone-100">
        <MediaHero home={homePayload} />
        <MediaCategoryTabs />

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[14.5rem_1fr] lg:py-10">
          <MediaSidebar />

          <div className="grid gap-8">
            {status === 'fallback' && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-stone-300">
                Media API content is loading from curated placeholders until the backend response is available.
              </div>
            )}
            {status === 'loading' && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-stone-300">
                Loading media library...
              </div>
            )}
            <MediaFeatured items={rails.featured.items} />
            <MediaRail title="Sermon Series" items={rails.series.items} variant="compact" />
            <MediaRail title="Latest Sermons" items={rails.latest.items} />
            <MediaRail title="Shorts & Highlights" items={rails.shorts.items} variant="portrait" />
          </div>
        </section>

        <MediaCallout />
      </main>

      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default MediaPage;
