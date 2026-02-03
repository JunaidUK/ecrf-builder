import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import { CohortBuilderPage } from './pages/CohortBuilderPage';
import { CohortSearchProvider } from './context/CohortSearchContext';

function App() {
  return (
    <CohortSearchProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/builder" element={<CohortBuilderPage />} />
        </Routes>
      </BrowserRouter>
    </CohortSearchProvider>
  );
}

export default App;
