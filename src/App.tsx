import { Route, Routes } from 'react-router-dom';
import RouteTransition from './components/RouteTransition';
import RequireAuth from './components/auth/RequireAuth';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import GivePage from './pages/GivePage';
import LandingPage from './pages/LandingPage';
import MediaPage from './pages/MediaPage';
import MediaWatchPage from './components/media/watch/MediaWatchPage';
import MinistriesPage from './pages/MinistriesPage';
import Project52Page from './pages/Project52Page';
import PortalPage from './pages/PortalPage';
import ResourcesPage from './pages/ResourcesPage';
import ScripturePage from './pages/ScripturePage';
import WritingArticlesPage from './pages/portal/writing/WritingArticlesPage';
import WritingAssignmentsPage from './pages/portal/writing/WritingAssignmentsPage';
import WritingEditorPage from './pages/portal/writing/WritingEditorPage';
import WritingEditorialPage from './pages/portal/writing/WritingEditorialPage';
import WritingLibraryPage from './pages/portal/writing/WritingLibraryPage';
import WritingNewArticlePage from './pages/portal/writing/WritingNewArticlePage';
import WritingStudioPage from './pages/portal/writing/WritingStudioPage';
import { AuthProvider } from './contexts/AuthContext';
import { Project52Provider } from './contexts/Project52Context';
import { ScriptureReaderProvider } from './contexts/ScriptureReaderContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Project52Provider>
        <ScriptureReaderProvider>
          <RouteTransition>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/give" element={<GivePage />} />
              <Route path="/media" element={<MediaPage />} />
              <Route path="/media/watch/:slug" element={<MediaWatchPage />} />
              <Route path="/ministries" element={<MinistriesPage />} />
              <Route path="/portal" element={<RequireAuth><PortalPage /></RequireAuth>} />
              <Route path="/portal/writing" element={<RequireAuth><WritingStudioPage /></RequireAuth>} />
              <Route path="/portal/writing/articles" element={<RequireAuth><WritingArticlesPage /></RequireAuth>} />
              <Route path="/portal/writing/new" element={<RequireAuth><WritingNewArticlePage /></RequireAuth>} />
              <Route path="/portal/writing/library" element={<RequireAuth><WritingLibraryPage /></RequireAuth>} />
              <Route path="/portal/writing/editorial" element={<RequireAuth><WritingEditorialPage /></RequireAuth>} />
              <Route path="/portal/writing/assignments" element={<RequireAuth><WritingAssignmentsPage /></RequireAuth>} />
              <Route path="/portal/writing/:id" element={<RequireAuth><WritingEditorPage /></RequireAuth>} />
              <Route path="/project52" element={<Project52Page />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/scripture" element={<ScripturePage />} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </RouteTransition>
        </ScriptureReaderProvider>
        </Project52Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

