import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardPage from '../pages/dashboard/DashboardPage';
import SettingsPage from '../pages/settings/SettingsPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/settings/*" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
