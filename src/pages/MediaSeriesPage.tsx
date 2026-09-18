import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import MediaSeriesDetail from '../components/media/MediaSeriesDetail';
import SiteFooter from '../components/navigation/SiteFooter';
import SiteHeader from '../components/navigation/SiteHeader';
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
        <PageContainer className="grid gap-7">
          <Link
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full text-sm font-black text-red-800 transition hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 dark:text-red-100"
            state={{ mediaTab: mediaReturnTab === 'series' ? 'series' : 'all' }}
            to="/media"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Media
          </Link>
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
        </PageContainer>
      </main>
      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default MediaSeriesPage;
