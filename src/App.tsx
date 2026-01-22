import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import { BuilderPage } from './pages/BuilderPage';
import { QuestionnaireProvider } from './context/QuestionnaireContext';

function App() {
  return (
    <QuestionnaireProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/builder/:id" element={<BuilderPage />} />
        </Routes>
      </BrowserRouter>
    </QuestionnaireProvider>
  );
}

export default App;
