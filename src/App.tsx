import { Route, Routes } from 'react-router-dom';
import RouteTransition from './components/RouteTransition';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import GivePage from './pages/GivePage';
import LandingPage from './pages/LandingPage';
import MediaPage from './pages/MediaPage';
import MediaWatchPage from './components/media/watch/MediaWatchPage';
import MinistriesPage from './pages/MinistriesPage';
import Project52Page from './pages/Project52Page';
import ScripturePage from './pages/ScripturePage';
import { Project52Provider } from './contexts/Project52Context';
import { ScriptureReaderProvider } from './contexts/ScriptureReaderContext';

function App() {
  return (
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
            <Route path="/project52" element={<Project52Page />} />
            <Route path="/scripture" element={<ScripturePage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </RouteTransition>
      </ScriptureReaderProvider>
    </Project52Provider>
  );
}

export default App;
