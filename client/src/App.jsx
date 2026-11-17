import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { DashboardPage } from './pages/DashboardPage';
import { OverviewPage } from './pages/OverviewPage';
import { ClientPage } from './pages/ClientPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';

export default function App() {
  const { user, initialized, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            user.role === 'client' ? (
              <Navigate to="/client" replace />
            ) : (
              <Navigate to="/overview" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/overview"
        element={user ? <OverviewPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/dashboard"
        element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/client"
        element={user ? <ClientPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/onboarding"
        element={user ? <OnboardingPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={
          user ? (
            user.role === 'client' ? (
              <Navigate to="/client" replace />
            ) : (
              <Navigate to="/overview" replace />
            )
          ) : (
            <LoginPage />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
