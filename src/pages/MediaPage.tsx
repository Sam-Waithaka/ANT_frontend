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
import {
  fetchAudioVisualCategories,
  fetchAudioVisualHome,
  fetchAudioVisualItems,
  fetchAudioVisualLanguages,
  fetchAudioVisualMediaTypes,
  fetchAudioVisualRails,
  fetchAudioVisualCollections,
  fetchFeaturedAudioVisualItems,
  fetchLatestAudioVisualItems,
  fetchLatestSermon,
  fetchLiveAudioVisualCta,
  fetchAudioVisualSeries,
} from '../services/audioVisualApi';
import type { AudioVisualHomePayload, AudioVisualItem, AudioVisualLookup, AudioVisualRail } from '../types/audioVisual';

const selectHeroSermon = (home: AudioVisualHomePayload, latestSermon: AudioVisualItem | null, useFallback: boolean) =>
  latestSermon || home.hero || (useFallback ? fallbackMediaHome.hero : null);

const mergeRail = (rail: AudioVisualRail | undefined, fallback: AudioVisualRail, endpointItems: AudioVisualItem[] = [], useFallback = false) => {
  if (rail && rail.items.length > 0) {
    return rail;
  }

  if (endpointItems.length > 0) {
    return { ...fallback, items: endpointItems };
  }

  return useFallback ? fallback : { ...fallback, items: [] };
};

const MediaPage = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [homePayload, setHomePayload] = useState<AudioVisualHomePayload>(fallbackMediaHome);
  const [latestSermon, setLatestSermon] = useState<AudioVisualItem | null>(null);
  const [endpointRails, setEndpointRails] = useState<AudioVisualRail[]>([]);
  const [featuredItems, setFeaturedItems] = useState<AudioVisualItem[]>([]);
  const [latestItems, setLatestItems] = useState<AudioVisualItem[]>([]);
  const [sermonItems, setSermonItems] = useState<AudioVisualItem[]>([]);
  const [shortItems, setShortItems] = useState<AudioVisualItem[]>([]);
  const [mediaTypes, setMediaTypes] = useState<AudioVisualLookup[]>([]);
  const [languages, setLanguages] = useState<AudioVisualLookup[]>([]);
  const [categories, setCategories] = useState<AudioVisualLookup[]>([]);
  const [series, setSeries] = useState<AudioVisualLookup[]>([]);
  const [collections, setCollections] = useState<AudioVisualLookup[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');

  useEffect(() => {
    const controller = new AbortController();

    Promise.allSettled([
      fetchAudioVisualHome(controller.signal),
      fetchAudioVisualRails(controller.signal),
      fetchLiveAudioVisualCta(controller.signal),
      fetchLatestSermon(controller.signal),
      fetchFeaturedAudioVisualItems(controller.signal),
      fetchLatestAudioVisualItems(controller.signal),
      fetchAudioVisualItems({ type: 'sermon', ordering: 'latest' }, controller.signal),
      fetchAudioVisualItems({ type: 'short', ordering: 'latest' }, controller.signal),
      fetchAudioVisualMediaTypes(controller.signal),
      fetchAudioVisualLanguages(controller.signal),
      fetchAudioVisualCategories(controller.signal),
      fetchAudioVisualSeries(controller.signal),
      fetchAudioVisualCollections(controller.signal),
    ])
      .then(([
        homeResult,
        railsResult,
        liveResult,
        latestSermonResult,
        featuredResult,
        latestResult,
        sermonsResult,
        shortsResult,
        mediaTypesResult,
        languagesResult,
        categoriesResult,
        seriesResult,
        collectionsResult,
      ]) => {
        const payload = homeResult.status === 'fulfilled' ? homeResult.value : fallbackMediaHome;
        const live = liveResult.status === 'fulfilled' && liveResult.value ? liveResult.value : payload.live;
        const nextPayload = { ...payload, live };
        const hasContent = Boolean(
          payload.hero ||
          payload.live ||
          payload.rails.some((rail) => rail.items.length > 0) ||
          (latestSermonResult.status === 'fulfilled' && latestSermonResult.value) ||
          (featuredResult.status === 'fulfilled' && featuredResult.value.length > 0) ||
          (latestResult.status === 'fulfilled' && latestResult.value.length > 0) ||
          (sermonsResult.status === 'fulfilled' && sermonsResult.value.length > 0) ||
          (shortsResult.status === 'fulfilled' && shortsResult.value.length > 0)
        );
        setHomePayload(hasContent ? nextPayload : fallbackMediaHome);
        setEndpointRails(railsResult.status === 'fulfilled' ? railsResult.value : []);
        setLatestSermon(latestSermonResult.status === 'fulfilled' ? latestSermonResult.value : null);
        setFeaturedItems(featuredResult.status === 'fulfilled' ? featuredResult.value : []);
        setLatestItems(latestResult.status === 'fulfilled' ? latestResult.value : []);
        setSermonItems(sermonsResult.status === 'fulfilled' ? sermonsResult.value : []);
        setShortItems(shortsResult.status === 'fulfilled' ? shortsResult.value : []);
        setMediaTypes(mediaTypesResult.status === 'fulfilled' ? mediaTypesResult.value : []);
        setLanguages(languagesResult.status === 'fulfilled' ? languagesResult.value : []);
        setCategories(categoriesResult.status === 'fulfilled' ? categoriesResult.value : []);
        setSeries(seriesResult.status === 'fulfilled' ? seriesResult.value : []);
        setCollections(collectionsResult.status === 'fulfilled' ? collectionsResult.value : []);
        setStatus(homeResult.status === 'fulfilled' && hasContent ? 'ready' : 'fallback');
      });

    return () => controller.abort();
  }, []);

  const rails = useMemo(() => {
    const railMap = new Map([...endpointRails, ...homePayload.rails].map((rail) => [rail.key, rail]));
    const useFallback = status === 'fallback';

    return {
      featured: mergeRail(railMap.get('featured'), fallbackMediaHome.rails[0], featuredItems, useFallback),
      series: mergeRail(railMap.get('series') || railMap.get('sermons'), fallbackMediaHome.rails[1], sermonItems, useFallback),
      latest: mergeRail(railMap.get('latest'), fallbackMediaHome.rails[2], latestItems, useFallback),
      shorts: mergeRail(railMap.get('shorts') || railMap.get('highlights'), fallbackMediaHome.rails[3], shortItems, useFallback),
    };
  }, [endpointRails, featuredItems, homePayload.rails, latestItems, sermonItems, shortItems, status]);
  const heroSermon = useMemo(() => selectHeroSermon(homePayload, latestSermon, status === 'fallback'), [homePayload, latestSermon, status]);

  return (
    <div className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader activePath="/media" darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main className={`flex-1 transition-colors duration-500 ${darkMode ? 'bg-[#050505] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
        <MediaHero darkMode={darkMode} heroItem={heroSermon} home={homePayload} />
        <MediaCategoryTabs darkMode={darkMode} mediaTypes={mediaTypes} />

        <section className="grid gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[14.5rem_1fr] lg:py-10 xl:px-8">
          <MediaSidebar categories={categories} collections={collections} darkMode={darkMode} languages={languages} mediaTypes={mediaTypes} series={series} />

          <div className="grid gap-8">
            {status === 'fallback' && (
              <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                darkMode ? 'border-white/10 bg-white/[0.04] text-stone-300' : 'border-black/10 bg-white text-zinc-700 shadow-sm shadow-zinc-900/5'
              }`}>
                Media API content is loading from curated placeholders until the backend response is available.
              </div>
            )}
            {status === 'loading' && (
              <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                darkMode ? 'border-white/10 bg-white/[0.04] text-stone-300' : 'border-black/10 bg-white text-zinc-700 shadow-sm shadow-zinc-900/5'
              }`}>
                Loading media library...
              </div>
            )}
            <MediaFeatured darkMode={darkMode} items={rails.featured.items} />
            <MediaRail darkMode={darkMode} title="Sermon Series" items={rails.series.items} variant="compact" />
            <MediaRail darkMode={darkMode} title="Latest Sermons" items={rails.latest.items} />
            <MediaRail darkMode={darkMode} title="Shorts & Highlights" items={rails.shorts.items} variant="portrait" />
          </div>
        </section>

        <MediaCallout darkMode={darkMode} />
      </main>

      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default MediaPage;
