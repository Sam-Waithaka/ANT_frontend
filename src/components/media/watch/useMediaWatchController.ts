import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getMediaWatchPath } from '../mediaLinks';
import {
  buildRelatedMediaQuery,
  defaultRelatedOrdering,
} from '../mediaWatchContext';
import type { MediaWatchContext, RelatedMediaOrdering } from '../mediaWatchContext';
import {
  autoplayModeForItem,
  resolveAutoplayDecision,
  shouldEnableAutoplayOnLoad,
} from './mediaAutoplay';
import { parseScriptureReferences } from './mediaWatchUtils';
import { prefetchVideoPlayer } from './VideoPlayer';
import {
  fetchAudioVisualItemPage,
  fetchAudioVisualWatchItem,
} from '../../../services/audioVisualApi';
import type { AudioVisualItem } from '../../../types/audioVisual';
import { copyToClipboard } from '../../../utils/copyToClipboard';

const RELATED_PAGE_SIZE = 10;
const UP_NEXT_SECONDS = 3;

export const useMediaWatchController = () => {
  const { slug = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
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
      .then((mediaItem) => {
        if (!mediaItem) {
          setStatus('error');
          return;
        }

        setItem(mediaItem);
        setStatus('ready');
        setRelatedOrdering(defaultRelatedOrdering(mediaItem, relatedContext));
        setAutoplayEnabled(shouldEnableAutoplayOnLoad(mediaItem, relatedContext, shouldAutoplayCurrent));
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
  const autoplayMode = autoplayModeForItem(item, relatedContext);
  const canLoadMoreRelated = Boolean(relatedNext) || relatedCount > relatedItems.length + (item ? 1 : 0);

  const loadRelatedPage = async (nextPage: number, currentItems = relatedItems) => {
    if (!item) {
      return { count: relatedCount, items: currentItems, next: relatedNext };
    }

    const query = buildRelatedMediaQuery(item, relatedOrdering, relatedContext);

    setRelatedStatus('loading-more');
    const page = await fetchAudioVisualItemPage({ ...query, page: nextPage, pageSize: RELATED_PAGE_SIZE });
    const seen = new Set(currentItems.map((candidate) => candidate.slug));
    const nextItems = page.items.filter((candidate) => candidate.slug !== item.slug && !seen.has(candidate.slug));
    const mergedItems = [...currentItems, ...nextItems];

    setRelatedItems(mergedItems);
    setRelatedCount(page.count);
    setRelatedNext(page.next);
    setRelatedPage(nextPage);
    setRelatedStatus('ready');

    return { count: page.count, items: mergedItems, next: page.next };
  };

  const handleRelatedLoadMore = () => {
    if (!item || relatedStatus === 'loading-more') {
      return;
    }

    loadRelatedPage(relatedPage + 1).catch(() => setRelatedStatus('ready'));
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
    if (!autoplayEnabled || !item || relatedStatus === 'loading-more') {
      return;
    }

    const handleDecision = async () => {
      const allowWrap = Boolean(isShort);
      let decision = resolveAutoplayDecision({
        allowWrap,
        count: autoplayCount,
        current: item,
        hasMore: canLoadMoreRelated,
        mode: autoplayMode,
        ordering: relatedOrdering,
        relatedItems,
        startedAt: autoplayStartedAt || Date.now(),
      });

      if (decision.type === 'load-more') {
        try {
          const loaded = await loadRelatedPage(relatedPage + 1);
          decision = resolveAutoplayDecision({
            allowWrap,
            count: autoplayCount,
            current: item,
            hasMore: Boolean(loaded.next) || loaded.count > loaded.items.length + 1,
            mode: autoplayMode,
            ordering: relatedOrdering,
            relatedItems: loaded.items,
            startedAt: autoplayStartedAt || Date.now(),
          });
        } catch {
          setRelatedStatus('ready');
          return;
        }
      }

      if (decision.type === 'still-watching') {
        setPendingNextItem(decision.item);
        setPauseEndedPlayback(true);
        setShowStillWatching(true);
        return;
      }

      if (decision.type === 'next') {
        beginAutoplayCountdown(decision.item);
      }
    };

    void handleDecision();
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

  const continueAfterStillWatching = () => {
    if (!pendingNextItem) return;

    setAutoplayCount(0);
    setAutoplayStartedAt(Date.now());
    setPauseEndedPlayback(false);
    playNextItem(pendingNextItem);
  };

  const stopAutoplay = () => {
    setAutoplayEnabled(false);
    setPauseEndedPlayback(false);
    setShowStillWatching(false);
    setPendingNextItem(null);
  };

  return {
    autoPlayNext,
    autoplayEnabled,
    autoplayMode,
    canLoadMoreRelated,
    cancelAutoplayCountdown,
    continueAfterStillWatching,
    countdown,
    handleBack,
    handlePlayerEnded,
    handleRelatedLoadMore,
    handleShare,
    isShort,
    item,
    pauseEndedPlayback,
    pendingNextItem,
    playNextItem,
    relatedItems,
    relatedOrdering,
    relatedStatus,
    scriptureReferences,
    setAutoplayEnabled,
    setRelatedOrdering,
    shareStatus,
    showStillWatching,
    status,
    stopAutoplay,
  };
};
