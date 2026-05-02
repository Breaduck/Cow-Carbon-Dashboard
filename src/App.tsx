import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common';
import { MapPage } from './pages/MapPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/:farmId" element={<DashboardPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
