import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './layouts/Layout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { DiscoverSkillsPage } from './pages/DiscoverSkillsPage';
import { PartnerFinderPage } from './pages/PartnerFinderPage';
import { CollaborationRequestsPage } from './pages/CollaborationRequestsPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { SkillSwapPage } from './pages/SkillSwapPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoadingSpinner } from './components/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Verifying security credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={adminOnly ? '/admin/login' : '/login'} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            
            {/* Public Routes */}
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="admin/login" element={<LoginPage isAdminPage={true} />} />

            {/* Protected Student Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="discover"
              element={
                <ProtectedRoute>
                  <DiscoverSkillsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="partner-finder"
              element={
                <ProtectedRoute>
                  <PartnerFinderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="requests"
              element={
                <ProtectedRoute>
                  <CollaborationRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="connections"
              element={
                <ProtectedRoute>
                  <ConnectionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects"
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="skill-swap"
              element={
                <ProtectedRoute>
                  <SkillSwapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile/:id"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/*"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
