import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { SeriesDetailPage } from './pages/SeriesDetailPage';
import { ProgressionDetailPage } from './pages/ProgressionDetailPage';
import { CalendarHistoryPage } from './pages/CalendarHistoryPage';
import { AboutPage } from './pages/AboutPage';
import { LOADING_MESSAGES } from './types';

function AuthGate() {
  const app = useApp();

  if (app.isLoadingAuth) {
    const msg = LOADING_MESSAGES[0];
    return (
      <div className="loading-screen">
        <span className="loading-text">{msg.toUpperCase()}</span>
      </div>
    );
  }

  if (!app.user) return <LoginPage />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="series/:seriesId" element={<SeriesDetailPage />} />
        <Route path="series/:seriesId/progression/:progressionId" element={<ProgressionDetailPage />} />
        <Route path="series/:seriesId/progression/:progressionId/history" element={<CalendarHistoryPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AuthGate />
      </AppProvider>
    </HashRouter>
  );
}
