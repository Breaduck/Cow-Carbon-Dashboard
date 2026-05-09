import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common';
import { MapPage } from './pages/MapPage';
import { DashboardPage } from './pages/DashboardPage';
import { RegionalStatsPage } from './pages/RegionalStatsPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/regional-stats" element={<RegionalStatsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/:farmId" element={<DashboardPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
