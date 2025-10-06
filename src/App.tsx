// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import AuthProvider from './context/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './pages/Login';
// import Dashboard from './pages/Dashboard'; // Commented out - not needed
import LiftPlanning from './pages/LiftPlanning';
import NotFound from './pages/NotFound';
import OAuthCallback from './pages/OAuthCallback';
import ErrorBoundary from './components/common/ErrorBoundary';
import { tokenManager } from './utils/tokenManager';
import { useEffect } from 'react';

import { ROUTES } from './constants/routes';
import { PWAInstaller } from './components/PWAInstaller';

const App = () => {
  useEffect(() => {
    // Start token monitoring when app loads
    tokenManager.startTokenMonitoring();
  }, []);

  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AuthProvider>
            <Routes>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallback />} />
              {/* Redirect root path to lift-plan */}
              <Route path="/" element={<Navigate to={ROUTES.LIFT_PLAN} replace />} />
              {/* Dashboard route commented out - users go directly to lift-plan
              <Route path={ROUTES.DASHBOARD} element={
                <ErrorBoundary>
                  <ProtectedRoute pagetitle='Dashboard'>
                    <Dashboard />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              */}
              <Route path={ROUTES.LIFT_PLAN} element={
                <ErrorBoundary>
                  <ProtectedRoute pagetitle='Lift Plan'>
                    <LiftPlanning />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <PWAInstaller />
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;