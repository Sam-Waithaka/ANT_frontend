import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Project52Page from './pages/Project52Page';
import ScripturePage from './pages/ScripturePage';
import { Project52Provider } from './contexts/Project52Context';

function App() {
  return (
    <Project52Provider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/project52" element={<Project52Page />} />
        <Route path="/scripture" element={<ScripturePage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Project52Provider>
  );
}

export default App;
