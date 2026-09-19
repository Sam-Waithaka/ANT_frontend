import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import MemorialPortalShell from './components/MemorialPortalShell';
import { MemorialPortalProvider } from './hooks/MemorialPortalContext';

const ArrangementsPage = lazy(() => import('./pages/ArrangementsPage'));
const MediaPage = lazy(() => import('./pages/MediaPage'));
const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const PageSettingsPage = lazy(() => import('./pages/PageSettingsPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const TributesPage = lazy(() => import('./pages/TributesPage'));
const WritingPage = lazy(() => import('./pages/WritingPage'));

const WorkspaceLoading = () => <p className="py-12 text-center text-sm font-bold" role="status">Opening memorial workspace...</p>;

const MemorialPortalPage = () => {
  const { memorialSlug } = useParams<{ memorialSlug: string }>();
  if (!memorialSlug) return <Navigate replace to="/portal/memorials" />;

  return (
  <MemorialPortalProvider slug={memorialSlug}>
    <MemorialPortalShell>
      <Suspense fallback={<WorkspaceLoading />}>
        <Routes>
          <Route element={<Navigate replace to="overview" />} index />
          <Route element={<OverviewPage />} path="overview" />
          <Route element={<PageSettingsPage />} path="page" />
          <Route element={<WritingPage />} path="writing" />
          <Route element={<TributesPage />} path="tributes" />
          <Route element={<TimelinePage />} path="timeline" />
          <Route element={<MediaPage />} path="media" />
          <Route element={<ArrangementsPage />} path="arrangements" />
          <Route element={<ReviewPage />} path="review" />
          <Route element={<Navigate replace to="overview" />} path="*" />
        </Routes>
      </Suspense>
    </MemorialPortalShell>
  </MemorialPortalProvider>
  );
};

export default MemorialPortalPage;
