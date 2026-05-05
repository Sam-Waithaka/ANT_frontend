import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Project52Page from './pages/Project52Page';
import ScripturePage from './pages/ScripturePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/project52" element={<Project52Page />} />
      <Route path="/scripture" element={<ScripturePage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
