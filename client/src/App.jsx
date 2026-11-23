import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Diseases from './pages/Diseases';
import Medicines from './pages/Medicines';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Prescriptions from './pages/Prescriptions';
import Appointments from './pages/Appointments';
import Doctors from './pages/Doctors';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import RecycleBin from './pages/RecycleBin';
import { ToastProvider } from './context/ToastContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/diseases"
              element={
                <ProtectedRoute>
                  <Diseases />
                </ProtectedRoute>
              }
            />

            <Route
              path="/medicines"
              element={
                <ProtectedRoute>
                  <Medicines />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patients"
              element={
                <ProtectedRoute>
                  <Patients />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patients/:id"
              element={
                <ProtectedRoute>
                  <PatientDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/prescriptions"
              element={
                <ProtectedRoute>
                  <Prescriptions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctors"
              element={
                <ProtectedRoute>
                  <Doctors />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/recycle-bin"
              element={
                <ProtectedRoute>
                  <RecycleBin />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
