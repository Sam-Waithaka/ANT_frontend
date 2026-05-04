import LandingPage from './pages/LandingPage';
import Project52Page from './pages/Project52Page';
import ScripturePage from './pages/ScripturePage';

function App() {
  const path = window.location.pathname;

  if (path === '/project52') {
    return <Project52Page />;
  }

  if (path === '/scripture') {
    return <ScripturePage />;
  }

  return <LandingPage />;
}

export default App;
