import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RelatedMediaRow from '../components/media/watch/RelatedMediaRow';
import ScriptureReferenceCard from '../components/media/watch/ScriptureReferenceCard';
import VideoMeta from '../components/media/watch/VideoMeta';
import VideoPlayer from '../components/media/watch/VideoPlayer';
import { parseScriptureReferences } from '../components/media/watch/mediaWatchUtils';
import { getMediaWatchPath } from '../components/media/mediaLinks';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useTheme } from '../hooks/useTheme';
import {
  fetchAudioVisualItems,
  fetchAudioVisualWatchItem,
} from '../services/audioVisualApi';
import type { AudioVisualItem } from '../types/audioVisual';

const MediaWatchPage = () => {
  const { slug = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [item, setItem] = useState<AudioVisualItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<AudioVisualItem[]>([]);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();

    setStatus('loading');
    setItem(null);
    setRelatedItems([]);

    fetchAudioVisualWatchItem(slug, controller.signal)
      .then(async (mediaItem) => {
        if (!mediaItem) {
          setStatus('error');
          return;
        }

        setItem(mediaItem);
        setStatus('ready');

        const isShort = mediaItem.mediaType.toLowerCase() === 'short';
        const seriesSlug = mediaItem.series?.slug;
        const categorySlug = mediaItem.categories[0]?.slug;
        const related =
          isShort
            ? await fetchAudioVisualItems({ type: 'short', ordering: 'latest' }, controller.signal)
            : seriesSlug
            ? await fetchAudioVisualItems({ series: seriesSlug, ordering: 'latest' }, controller.signal)
            : categorySlug
              ? await fetchAudioVisualItems({ category: categorySlug, ordering: 'latest' }, controller.signal)
              : await fetchAudioVisualItems({ type: mediaItem.mediaType, ordering: 'latest' }, controller.signal);

        const filteredRelated = related.filter((candidate) => candidate.slug !== mediaItem.slug).slice(0, 10);

        if (filteredRelated.length > 0) {
          setRelatedItems(filteredRelated);
          return;
        }

        const fallbackRelated = await fetchAudioVisualItems({ ordering: 'latest' }, controller.signal);
        setRelatedItems(fallbackRelated.filter((candidate) => candidate.slug !== mediaItem.slug).slice(0, 10));
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStatus('error');
        }
      });

    return () => controller.abort();
  }, [slug]);

  const scriptureReferences = useMemo(() => parseScriptureReferences(item?.scriptureReference), [item?.scriptureReference]);
  const isShort = item?.mediaType.toLowerCase() === 'short';
  const isSermon = item?.mediaType.toLowerCase() === 'sermon';
  const showScriptureBesideMeta = Boolean(isSermon && scriptureReferences.length > 0);
  const nextShort = isShort ? relatedItems.find((candidate) => candidate.mediaType.toLowerCase() === 'short') : undefined;

  const handlePlayerEnded = () => {
    if (!isShort || !nextShort) {
      return;
    }

    setAutoPlayNext(true);
    navigate(getMediaWatchPath(nextShort));
  };

  const handleBack = () => {
    const from = typeof location.state?.from === 'string' ? location.state.from : '';
    const historyIndex = typeof window !== 'undefined' ? window.history.state?.idx : 0;

    if (from) {
      navigate(from);
      return;
    }

    if (historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate('/media');
  };

  return (
    <div className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader activePath="/media" darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main className={`relative flex-1 ${darkMode ? 'bg-[#080808]' : 'bg-[#f8f5ef]'}`}>
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,rgba(127,29,29,0.32),transparent_36%)]" />
        <div className="relative px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <button
            type="button"
            onClick={handleBack}
            className={`group mb-6 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-black shadow-xl backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 ${
              darkMode
                ? 'border-white/15 bg-white/[0.09] text-white shadow-black/30 ring-1 ring-white/10 hover:border-red-200/25 hover:bg-white/[0.13] hover:shadow-red-950/30'
                : 'border-white/70 bg-white/65 text-zinc-950 shadow-zinc-900/10 ring-1 ring-black/5 hover:border-red-900/10 hover:bg-white/85 hover:shadow-red-900/10'
            }`}
          >
            <span
              className={`grid size-7 place-items-center rounded-full transition ${
                darkMode ? 'bg-white/10 text-red-100 group-hover:bg-red-800' : 'bg-red-950/5 text-red-800 group-hover:bg-red-800 group-hover:text-white'
              }`}
            >
              <ArrowLeft size={16} />
            </span>
            Back
          </button>

          {status === 'loading' && (
            <div className={`rounded-3xl border p-8 text-center text-sm font-bold ${darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-black/10 bg-white text-zinc-700'}`}>
              Loading media player...
            </div>
          )}

          {status === 'error' && (
            <div className={`rounded-3xl border p-8 text-center ${darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-black/10 bg-white text-zinc-700'}`}>
              <h1 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-zinc-950'}`}>Media unavailable</h1>
              <p className="mt-3 text-sm font-bold">We could not load this message right now.</p>
              <button type="button" onClick={handleBack} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-red-800 px-5 text-sm font-black text-white hover:bg-red-700">
                Back to media
              </button>
            </div>
          )}

          {item && (
            <div className="grid gap-10">
              <VideoPlayer autoPlay={autoPlayNext} darkMode={darkMode} isShort={isShort} item={item} onEnded={handlePlayerEnded} />

              {showScriptureBesideMeta ? (
                <div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)] md:items-start xl:grid-cols-[minmax(0,0.82fr)_minmax(30rem,1.18fr)]">
                  <VideoMeta darkMode={darkMode} item={item} />
                  <section className="grid gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Scripture</p>
                      <h2 className={`mt-2 text-3xl font-extrabold tracking-normal ${darkMode ? 'text-white' : 'text-zinc-950'}`}>Referenced Scriptures</h2>
                    </div>
                    <div className="grid gap-4">
                      {scriptureReferences.map((reference) => (
                        <ScriptureReferenceCard key={reference.display} darkMode={darkMode} reference={reference} />
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <>
                  <VideoMeta darkMode={darkMode} item={item} />

                  {scriptureReferences.length > 0 && (
                    <section className="grid gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Scripture</p>
                        <h2 className={`mt-2 text-3xl font-extrabold tracking-normal ${darkMode ? 'text-white' : 'text-zinc-950'}`}>Referenced Scriptures</h2>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {scriptureReferences.map((reference) => (
                          <ScriptureReferenceCard key={reference.display} darkMode={darkMode} reference={reference} />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              <RelatedMediaRow darkMode={darkMode} items={relatedItems} />
            </div>
          )}
        </div>
      </main>

      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default MediaWatchPage;
