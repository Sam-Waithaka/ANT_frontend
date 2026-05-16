import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RelatedMediaRow from '../components/media/watch/RelatedMediaRow';
import ScriptureReferenceCard from '../components/media/watch/ScriptureReferenceCard';
import VideoMeta from '../components/media/watch/VideoMeta';
import VideoPlayer, { prefetchVideoPlayer } from '../components/media/watch/VideoPlayer';
import { parseScriptureReferences } from '../components/media/watch/mediaWatchUtils';
import { getMediaWatchPath } from '../components/media/mediaLinks';
import {
  buildRelatedMediaQuery,
  defaultRelatedOrdering,
} from '../components/media/mediaWatchContext';
import type { MediaWatchContext, RelatedMediaOrdering } from '../components/media/mediaWatchContext';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useTheme } from '../hooks/useTheme';
import {
  fetchAudioVisualItemPage,
  fetchAudioVisualWatchItem,
} from '../services/audioVisualApi';
import type { AudioVisualItem } from '../types/audioVisual';
import { copyToClipboard } from '../utils/copyToClipboard';

const RELATED_PAGE_SIZE = 10;
const UP_NEXT_SECONDS = 3;

type AutoplayMode = 'general' | 'music' | 'series' | 'shorts';

const autoplayModeForItem = (item: AudioVisualItem | null, context?: MediaWatchContext): AutoplayMode => {
  if (item?.mediaType.toLowerCase() === 'short') return 'shorts';
  if (context?.series || item?.series?.slug) return 'series';
  if (context?.type?.toLowerCase() === 'music' || item?.mediaType.toLowerCase() === 'music') return 'music';
  return 'general';
};

const shouldDefaultAutoplay = (item: AudioVisualItem | null, context?: MediaWatchContext) => {
  const mode = autoplayModeForItem(item, context);
  return mode === 'shorts' || mode === 'series';
};

const autoplayLimitReached = (mode: AutoplayMode, startedAt: number, count: number) => {
  const elapsedMinutes = (Date.now() - startedAt) / 60000;

  if (mode === 'shorts') return count >= 20 || elapsedMinutes >= 30;
  if (mode === 'series') return count >= 3 || elapsedMinutes >= 180;
  if (mode === 'music') return elapsedMinutes >= 90;
  return count >= 5 || elapsedMinutes >= 120;
};

const mediaTime = (item?: AudioVisualItem | null) => {
  const time = item?.publishedAt ? new Date(item.publishedAt).getTime() : Number.NaN;
  return Number.isFinite(time) ? time : 0;
};

const selectNextRelatedItem = (
  current: AudioVisualItem | null,
  relatedItems: AudioVisualItem[],
  ordering: RelatedMediaOrdering
) => {
  if (!current) return relatedItems[0];
  const currentTime = mediaTime(current);

  if (currentTime) {
    const directionalNext = relatedItems.find((candidate) => {
      const candidateTime = mediaTime(candidate);
      if (!candidateTime) return false;
      return ordering === 'oldest' ? candidateTime > currentTime : candidateTime < currentTime;
    });

    if (directionalNext) return directionalNext;
  }

  return relatedItems[0];
};

const MediaWatchPage = () => {
  const { slug = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [item, setItem] = useState<AudioVisualItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<AudioVisualItem[]>([]);
  const [relatedCount, setRelatedCount] = useState(0);
  const [relatedNext, setRelatedNext] = useState<string | null>(null);
  const [relatedOrdering, setRelatedOrdering] = useState<RelatedMediaOrdering>('latest');
  const [relatedPage, setRelatedPage] = useState(1);
  const [relatedStatus, setRelatedStatus] = useState<'idle' | 'loading' | 'loading-more' | 'ready'>('idle');
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [autoplayCount, setAutoplayCount] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const [autoplayStartedAt, setAutoplayStartedAt] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [pendingNextItem, setPendingNextItem] = useState<AudioVisualItem | null>(null);
  const [pauseEndedPlayback, setPauseEndedPlayback] = useState(false);
  const [showStillWatching, setShowStillWatching] = useState(false);
  const [shareStatus, setShareStatus] = useState<'copied' | 'idle'>('idle');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const relatedContext = location.state?.relatedContext as MediaWatchContext | undefined;
  const shouldAutoplayCurrent = location.state?.autoplayNext === true;
  const countdownTimerRef = useRef<number | null>(null);

  useEffect(() => {
    prefetchVideoPlayer();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    setStatus('loading');
    setItem(null);
    setRelatedItems([]);
    setRelatedCount(0);
    setRelatedNext(null);
    setRelatedPage(1);
    setRelatedStatus('idle');
    setAutoPlayNext(shouldAutoplayCurrent);
    setCountdown(0);
    setPendingNextItem(null);
    setPauseEndedPlayback(false);
    setShowStillWatching(false);

    fetchAudioVisualWatchItem(slug, controller.signal)
      .then(async (mediaItem) => {
        if (!mediaItem) {
          setStatus('error');
          return;
        }

        setItem(mediaItem);
        setStatus('ready');
        setRelatedOrdering(defaultRelatedOrdering(mediaItem, relatedContext));
        setAutoplayEnabled(shouldDefaultAutoplay(mediaItem, relatedContext));
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStatus('error');
        }
      });

    return () => controller.abort();
  }, [relatedContext, shouldAutoplayCurrent, slug]);

  useEffect(() => {
    if (!autoplayEnabled) {
      setAutoplayStartedAt(0);
      setAutoplayCount(0);
      setCountdown(0);
      setPendingNextItem(null);
      setShowStillWatching(false);
      return;
    }

    setAutoplayStartedAt((current) => current || Date.now());
  }, [autoplayEnabled]);

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        window.clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!item) {
      return;
    }

    const controller = new AbortController();
    const query = buildRelatedMediaQuery(item, relatedOrdering, relatedContext);

    setRelatedStatus('loading');
    setRelatedItems([]);
    setRelatedCount(0);
    setRelatedNext(null);
    setRelatedPage(1);

    fetchAudioVisualItemPage({ ...query, page: 1, pageSize: RELATED_PAGE_SIZE }, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;

        setRelatedItems(page.items.filter((candidate) => candidate.slug !== item.slug));
        setRelatedCount(page.count);
        setRelatedNext(page.next);
        setRelatedStatus('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRelatedStatus('ready');
        }
      });

    return () => controller.abort();
  }, [item, relatedContext, relatedOrdering]);

  const scriptureReferences = useMemo(() => parseScriptureReferences(item?.scriptureReference), [item?.scriptureReference]);
  const isShort = item?.mediaType.toLowerCase() === 'short';
  const isSermon = item?.mediaType.toLowerCase() === 'sermon';
  const showScriptureBesideMeta = Boolean(isSermon && scriptureReferences.length > 0);
  const autoplayMode = autoplayModeForItem(item, relatedContext);
  const nextRelatedItem = selectNextRelatedItem(item, relatedItems, relatedOrdering);
  const canLoadMoreRelated = Boolean(relatedNext) || relatedCount > relatedItems.length + (item ? 1 : 0);

  const handleRelatedLoadMore = () => {
    if (!item || relatedStatus === 'loading-more') {
      return;
    }

    const nextPage = relatedPage + 1;
    const controller = new AbortController();
    const query = buildRelatedMediaQuery(item, relatedOrdering, relatedContext);

    setRelatedStatus('loading-more');
    fetchAudioVisualItemPage({ ...query, page: nextPage, pageSize: RELATED_PAGE_SIZE }, controller.signal)
      .then((page) => {
        const seen = new Set(relatedItems.map((candidate) => candidate.slug));
        const nextItems = page.items.filter((candidate) => candidate.slug !== item.slug && !seen.has(candidate.slug));

        setRelatedItems((current) => [...current, ...nextItems]);
        setRelatedCount(page.count);
        setRelatedNext(page.next);
        setRelatedPage(nextPage);
        setRelatedStatus('ready');
      })
      .catch(() => setRelatedStatus('ready'));
  };

  const playNextItem = (nextItem: AudioVisualItem) => {
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    setAutoPlayNext(true);
    setAutoplayCount((count) => count + 1);
    setCountdown(0);
    setPendingNextItem(null);
    setPauseEndedPlayback(false);
    setShowStillWatching(false);
    navigate(getMediaWatchPath(nextItem), {
      state: {
        autoplayNext: true,
        from: typeof location.state?.from === 'string' ? location.state.from : '/media',
        relatedContext,
      },
    });
  };

  const cancelAutoplayCountdown = () => {
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    setCountdown(0);
    setPendingNextItem(null);
    setPauseEndedPlayback(false);
  };

  const beginAutoplayCountdown = (nextItem: AudioVisualItem) => {
    cancelAutoplayCountdown();
    setPendingNextItem(nextItem);
    setPauseEndedPlayback(true);
    setCountdown(UP_NEXT_SECONDS);

    countdownTimerRef.current = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          if (countdownTimerRef.current) {
            window.clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          playNextItem(nextItem);
          return 0;
        }

        return current - 1;
      });
    }, 1000);
  };

  const handlePlayerEnded = () => {
    if (!autoplayEnabled || !nextRelatedItem) {
      return;
    }

    if (autoplayLimitReached(autoplayMode, autoplayStartedAt || Date.now(), autoplayCount)) {
      setPendingNextItem(nextRelatedItem);
      setPauseEndedPlayback(true);
      setShowStillWatching(true);
      return;
    }

    beginAutoplayCountdown(nextRelatedItem);
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

  const handleShare = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}${getMediaWatchPath(item)}`;

    if (typeof navigator !== 'undefined' && navigator.share && item) {
      try {
        await navigator.share({
          title: item.title,
          text: item.descriptionExcerpt || item.description,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall through to clipboard when native sharing is cancelled or unavailable.
      }
    }

    const copied = await copyToClipboard(shareUrl);

    if (copied) {
      setShareStatus('copied');
      window.setTimeout(() => setShareStatus('idle'), 2200);
    }
  };

  return (
    <div className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader activePath="/media" darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main className={`relative flex-1 ${darkMode ? 'bg-[#080808]' : 'bg-[#f8f5ef]'}`}>
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,rgba(127,29,29,0.32),transparent_36%)]" />
        <div className="relative px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className={`group inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-black shadow-xl backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 ${
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
          </div>

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
              <VideoPlayer
                autoPlay={autoPlayNext}
                darkMode={darkMode}
                isShort={isShort}
                item={item}
                onEnded={handlePlayerEnded}
                pausePlayback={pauseEndedPlayback}
              />
              <section
                className={`rounded-3xl border p-4 shadow-xl ${
                  darkMode ? 'border-white/10 bg-white/[0.05] shadow-black/20' : 'border-black/10 bg-white/80 shadow-zinc-900/10'
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Autoplay</p>
                    <p className={`mt-1 text-sm font-bold ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
                      {autoplayEnabled
                        ? `Up next follows this ${autoplayMode === 'series' ? 'series' : autoplayMode === 'music' ? 'music queue' : autoplayMode === 'shorts' ? 'shorts queue' : 'related queue'}.`
                        : 'Autoplay is off. Turn it on to continue through related media.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoplayEnabled((enabled) => !enabled)}
                    aria-pressed={autoplayEnabled}
                    className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-black transition ${
                      autoplayEnabled
                        ? 'border-red-800 bg-red-800 text-white shadow-lg shadow-red-950/20 hover:bg-red-700'
                        : darkMode
                          ? 'border-white/15 bg-white/10 text-stone-100 hover:bg-white/15'
                          : 'border-black/10 bg-white text-zinc-800 shadow-sm hover:bg-[#fffaf0]'
                    }`}
                  >
                    Autoplay {autoplayEnabled ? 'On' : 'Off'}
                  </button>
                </div>

                {pendingNextItem && countdown > 0 && (
                  <div className={`mt-4 rounded-2xl border p-4 ${darkMode ? 'border-white/10 bg-black/20' : 'border-black/10 bg-[#fffaf0]'}`}>
                    <p className={`text-sm font-bold ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>Up next in {countdown}s</p>
                    <h3 className={`mt-1 text-lg font-black ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{pendingNextItem.title}</h3>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" onClick={() => playNextItem(pendingNextItem)} className="inline-flex min-h-10 items-center rounded-full bg-red-800 px-4 text-sm font-black text-white hover:bg-red-700">
                        Play now
                      </button>
                      <button
                        type="button"
                        onClick={cancelAutoplayCountdown}
                        className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-black ${
                          darkMode ? 'border-white/10 text-stone-200 hover:bg-white/10' : 'border-black/10 text-zinc-800 hover:bg-white'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {showStillWatching && pendingNextItem && (
                  <div className={`mt-4 rounded-2xl border p-4 ${darkMode ? 'border-red-200/15 bg-red-950/20' : 'border-red-900/15 bg-red-50'}`}>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Still watching?</p>
                    <h3 className={`mt-2 text-lg font-black ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{pendingNextItem.title}</h3>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
                      We paused autoplay so the queue does not keep running unattended.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAutoplayCount(0);
                          setAutoplayStartedAt(Date.now());
                          setPauseEndedPlayback(false);
                          playNextItem(pendingNextItem);
                        }}
                        className="inline-flex min-h-10 items-center rounded-full bg-red-800 px-4 text-sm font-black text-white hover:bg-red-700"
                      >
                        Continue
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAutoplayEnabled(false);
                          setPauseEndedPlayback(false);
                          setShowStillWatching(false);
                          setPendingNextItem(null);
                        }}
                        className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-black ${
                          darkMode ? 'border-white/10 text-stone-200 hover:bg-white/10' : 'border-black/10 text-zinc-800 hover:bg-white'
                        }`}
                      >
                        Stop autoplay
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {showScriptureBesideMeta ? (
                <div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)] md:items-start xl:grid-cols-[minmax(0,0.82fr)_minmax(30rem,1.18fr)]">
                  <VideoMeta darkMode={darkMode} item={item} onShare={handleShare} shareStatus={shareStatus} />
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
                  <VideoMeta darkMode={darkMode} item={item} onShare={handleShare} shareStatus={shareStatus} />

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

              <RelatedMediaRow
                canLoadMore={canLoadMoreRelated}
                darkMode={darkMode}
                items={relatedItems}
                loadingMore={relatedStatus === 'loading-more'}
                ordering={relatedOrdering}
                onLoadMore={handleRelatedLoadMore}
                onOrderingChange={setRelatedOrdering}
              />
            </div>
          )}
        </div>
      </main>

      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default MediaWatchPage;
