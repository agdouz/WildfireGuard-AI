
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DetectionConsole from './pages/DetectionConsole';
import FireWeatherIndex from './pages/FireWeatherIndex';
import RealTimePrevention from './pages/RealTimePrevention';

import UploadDetection from './pages/UploadDetection';
import PredictionDashboard from './pages/PredictionDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/detection" element={<DetectionConsole />} />
        <Route path="/upload" element={<UploadDetection />} />
        <Route path="/prevention" element={<RealTimePrevention />} />
        <Route path="/satellite" element={<Navigate to="/prevention" replace />} />
        <Route path="/fwi" element={<FireWeatherIndex />} />
        <Route path="/prediction" element={<PredictionDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
