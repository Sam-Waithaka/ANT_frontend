import { lazy, Suspense, type ReactNode } from "react";
import { CalendarDays, CircleHelp, Settings } from "lucide-react";
import { Route, Routes } from "react-router-dom";
import RouteTransition from "./components/routing/RouteTransition";
import MobileBottomActionsProvider from "./components/navigation/MobileBottomActionsProvider";
import RequireAuth from "./components/auth/RequireAuth";
import RequirePortalAccess from "./components/auth/RequirePortalAccess";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import GivePage from "./pages/GivePage";
import LandingPage from "./pages/LandingPage";
import MediaPage from "./pages/MediaPage";
import MediaSeriesPage from "./pages/MediaSeriesPage";
import MediaWatchPage from "./components/media/watch/MediaWatchPage";
import MinistriesPage from "./pages/MinistriesPage";
import Project52Page from "./pages/Project52Page";
import PlannedDestinationPage from "./pages/PlannedDestinationPage";
import ResourcesBrowsePage from "./pages/ResourcesBrowsePage";
import ResourcesDetailPage from "./pages/ResourcesDetailPage";
import ResourcesPage from "./pages/ResourcesPage";
import ScripturePage from "./pages/ScripturePage";
import { AuthProvider } from "./contexts/AuthContext";
import { Project52Provider } from "./contexts/Project52Context";
import { ScriptureReaderProvider } from "./contexts/ScriptureReaderContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const AccountPage = lazy(() => import("./pages/AccountPage"));
const PortalRuntime = lazy(() => import("./components/portal/PortalRuntime"));
const PortalPage = lazy(() => import("./pages/PortalPage"));
const WritingArticlesPage = lazy(() => import("./pages/portal/writing/WritingArticlesPage"));
const WritingEditorPage = lazy(() => import("./pages/portal/writing/WritingEditorPage"));
const WritingEditorialPage = lazy(() => import("./pages/portal/writing/WritingEditorialPage"));
const WritingLibraryPage = lazy(() => import("./pages/portal/writing/WritingLibraryPage"));
const WritingNewArticlePage = lazy(() => import("./pages/portal/writing/WritingNewArticlePage"));
const WritingStudioPage = lazy(() => import("./pages/portal/writing/WritingStudioPage"));
const MemorialPortalPage = lazy(() => import("./pages/portal/memorials/MemorialPortalPage"));
const MemorialEditorPlaceholderPage = lazy(() => import("./pages/portal/memorials/MemorialEditorPlaceholderPage"));

const ProtectedRouteLoadingState = ({ label }: { label: string }) => (
  <div
    className="grid min-h-screen place-items-center bg-[#f8f5ef] px-4 text-center text-zinc-700 dark:bg-[#080808] dark:text-stone-300"
    role="status"
  >
    <div className="rounded-3xl border border-black/10 bg-white px-6 py-5 text-sm font-bold shadow-xl shadow-zinc-900/10 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/30">
      {label}
    </div>
  </div>
);

const PortalRoute = ({ children }: { children: ReactNode }) => (
  <RequirePortalAccess>
    <Suspense fallback={<ProtectedRouteLoadingState label="Opening Portal..." />}>
      <PortalRuntime>{children}</PortalRuntime>
    </Suspense>
  </RequirePortalAccess>
);

const AccountRoute = ({ children }: { children: ReactNode }) => (
  <RequireAuth>
    <Suspense fallback={<ProtectedRouteLoadingState label="Opening your account..." />}>
      {children}
    </Suspense>
  </RequireAuth>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Project52Provider>
          <ScriptureReaderProvider>
            <MobileBottomActionsProvider>
              <RouteTransition>
                <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/events" element={<PlannedDestinationPage eyebrow="Church life" icon={CalendarDays} title="Events" description="Upcoming services, gatherings, ministry activities, and important church dates will be shared here." />} />
                <Route path="/give" element={<GivePage />} />
                <Route path="/help" element={<PlannedDestinationPage eyebrow="Support" icon={CircleHelp} title="Help" description="Guidance for using Scripture, Project 52, Resources, Media, and your church account will live here." />} />
                <Route path="/media" element={<MediaPage />} />
                <Route path="/media/series/:slug" element={<MediaSeriesPage />} />
                <Route path="/media/watch/:slug" element={<MediaWatchPage />} />
                <Route path="/ministries" element={<MinistriesPage />} />
                <Route path="/settings" element={<PlannedDestinationPage eyebrow="Preferences" icon={Settings} title="Settings" description="Site preferences, accessibility options, notifications, and personal defaults will be managed here." />} />
                <Route path="/account" element={<AccountRoute><AccountPage /></AccountRoute>} />
                <Route path="/account/profile" element={<AccountRoute><AccountPage profile /></AccountRoute>} />
                <Route
                  path="/portal"
                  element={
                    <PortalRoute>
                      <PortalPage />
                    </PortalRoute>
                  }
                />
                <Route
                  path="/portal/writing"
                  element={
                    <PortalRoute>
                      <WritingStudioPage />
                    </PortalRoute>
                  }
                />
                <Route
                  path="/portal/memorials"
                  element={
                    <PortalRoute>
                      <MemorialPortalPage />
                    </PortalRoute>
                  }
                />
                <Route
                  path="/portal/memorials/:id"
                  element={
                    <PortalRoute>
                      <MemorialEditorPlaceholderPage />
                    </PortalRoute>
                  }
                />
                <Route
                  path="/portal/writing/articles"
                  element={
                    <PortalRoute>
                      <WritingArticlesPage />
                    </PortalRoute>
                  }
                />
                <Route
                  path="/portal/writing/new"
                  element={
                    <PortalRoute>
                      <WritingNewArticlePage />
                    </PortalRoute>
                  }
                />
                <Route
                  path="/portal/writing/library"
                  element={
                    <PortalRoute>
                      <WritingLibraryPage />
                    </PortalRoute>
                  }
                />
                <Route
                  path="/portal/writing/editorial"
                  element={
                    <PortalRoute>
                      <WritingEditorialPage />
                    </PortalRoute>
                  }
                />
                <Route
                  path="/portal/writing/:id"
                  element={
                    <PortalRoute>
                      <WritingEditorPage />
                    </PortalRoute>
                  }
                />
                <Route path="/project52" element={<Project52Page />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route
                  path="/resources/type/:slug"
                  element={<ResourcesBrowsePage mode="type" />}
                />
                <Route
                  path="/resources/category/:slug"
                  element={<ResourcesBrowsePage mode="category" />}
                />
                <Route
                  path="/resources/series/:slug"
                  element={<ResourcesBrowsePage mode="series" />}
                />
                <Route
                  path="/resources/book/:osisId"
                  element={<ResourcesBrowsePage mode="book" />}
                />
                <Route
                  path="/resources/ministry/:slug"
                  element={<ResourcesBrowsePage mode="ministry" />}
                />
                <Route
                  path="/resources/:slug"
                  element={<ResourcesDetailPage />}
                />
                <Route path="/scripture" element={<ScripturePage />} />
                <Route path="*" element={<LandingPage />} />
                </Routes>
              </RouteTransition>
            </MobileBottomActionsProvider>
          </ScriptureReaderProvider>
        </Project52Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
