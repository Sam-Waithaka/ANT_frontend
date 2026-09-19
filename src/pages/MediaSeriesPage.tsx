import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import MediaBackButton from '../components/media/MediaBackButton';
import MediaSeriesDetail from '../components/media/MediaSeriesDetail';
import SiteFooter from '../components/navigation/SiteFooter';
import SiteHeader from '../components/navigation/SiteHeader';
import ShareButton from '../components/share/ShareButton';
import { truncateShareText, useShareAction, type SharePayload } from '../components/share/useShareAction';
import { usePaginatedMediaItems } from '../hooks/usePaginatedMediaItems';
import { useTheme } from '../hooks/useTheme';
import { fetchAudioVisualSeriesDetail } from '../services/audioVisualApi';
import type { AudioVisualGroupDetail } from '../types/audioVisual';

type SeriesRequestState = {
  series: AudioVisualGroupDetail | null;
  slug: string;
  status: 'loading' | 'ready' | 'error';
};

const SERIES_PAGE_SIZE = 12;

const MediaSeriesPage = () => {
  const { slug = '' } = useParams<{ slug?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [requestState, setRequestState] = useState<SeriesRequestState>({ series: null, slug, status: 'loading' });
  const mediaReturnTab = (location.state as { mediaReturnTab?: 'all' | 'series' } | null)?.mediaReturnTab;
  const seriesQuery = useMemo(() => ({ ordering: 'oldest' as const, series: slug }), [slug]);
  const media = usePaginatedMediaItems(seriesQuery, { pageSize: SERIES_PAGE_SIZE });
  const currentState = requestState.slug === slug
    ? requestState
    : { series: null, slug, status: 'loading' as const };
  const pageStatus = currentState.status === 'error' || media.status === 'error'
    ? 'error'
    : currentState.status === 'loading' || media.status === 'loading'
      ? 'loading'
      : 'ready';
  const sharePayload = useMemo<SharePayload | null>(() => {
    if (pageStatus !== 'ready' || !currentState.series) return null;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const seriesPath = `/media/series/${encodeURIComponent(currentState.series.slug || slug)}`;

    return {
      title: currentState.series.name,
      text: truncateShareText(currentState.series.description),
      url: `${origin}${seriesPath}`,
    };
  }, [currentState.series, pageStatus, slug]);
  const { share, shareStatus } = useShareAction(sharePayload);
  const handleBack = () => {
    navigate('/media', {
      state: { mediaTab: mediaReturnTab === 'series' ? 'series' : 'all' },
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    fetchAudioVisualSeriesDetail(slug, controller.signal)
      .then((nextSeries) => {
        if (!controller.signal.aborted) {
          setRequestState({ series: nextSeries, slug, status: 'ready' });
        }
      })
      .catch((error) => {
        if (controller.signal.aborted || error instanceof DOMException && error.name === 'AbortError') return;
        setRequestState({ series: null, slug, status: 'error' });
      });

    return () => controller.abort();
  }, [slug]);

  return (
    <div className={`flex min-h-screen w-full max-w-full min-w-0 flex-col transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader darkMode={darkMode} onToggleTheme={toggleTheme} />
      <main className={`flex-1 py-8 sm:py-10 lg:py-12 ${darkMode ? 'bg-[#080808]' : 'bg-[linear-gradient(180deg,#f8f5ef,#fffaf0_42%,#f8f5ef)]'}`}>
        <div className="box-border grid w-full max-w-full min-w-0 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex min-w-0 items-center justify-between gap-4">
            <MediaBackButton darkMode={darkMode} onBack={handleBack} />
            {sharePayload ? (
              <ShareButton
                darkMode={darkMode}
                onShare={() => { void share(); }}
                shareStatus={shareStatus}
                variant="primary"
              />
            ) : null}
          </div>
          <MediaSeriesDetail
            canLoadMore={media.canLoadMore}
            darkMode={darkMode}
            itemCount={media.count}
            items={media.items}
            loadMoreError={media.error}
            loadingMore={media.loadingMore}
            onLoadMore={() => { void media.loadMore(); }}
            series={currentState.series}
            status={pageStatus}
          />
        </div>
      </main>
      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default MediaSeriesPage;
