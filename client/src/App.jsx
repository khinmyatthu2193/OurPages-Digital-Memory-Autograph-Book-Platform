import { Route, Routes } from 'react-router-dom';
import AuthProvider from './auth/AuthProvider.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import DashboardLayout from './components/dashboard/DashboardLayout.jsx';
import ToastProvider from './components/feedback/ToastProvider.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MemoriesPage from './pages/MemoriesPage.jsx';
import MyPagePage from './pages/MyPagePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PublicBookPage from './pages/PublicBookPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="u/:username" element={<PublicBookPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="memories" element={<MemoriesPage />} />
            <Route path="my-page" element={<MyPagePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
