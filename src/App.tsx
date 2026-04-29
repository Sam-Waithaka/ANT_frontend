import LandingPage from './pages/LandingPage';
import Project52Page from './pages/Project52Page';

function App() {
  return window.location.pathname === '/project52' ? <Project52Page /> : <LandingPage />;
}

export default App;
