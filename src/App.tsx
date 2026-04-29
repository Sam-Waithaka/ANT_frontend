import BibleReadingExcel from './BibleReadingExcel';
import LandingPage from './pages/LandingPage';

function App() {
  return window.location.pathname === '/project52' ? <BibleReadingExcel /> : <LandingPage />;
}

export default App;
