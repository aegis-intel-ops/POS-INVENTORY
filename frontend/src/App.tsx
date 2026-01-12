import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import PosTerminal from './pages/PosTerminal';
import ReportsDashboard from './pages/ReportsDashboard';
import ProductManagement from './pages/ProductManagement';
import UserManagement from './pages/UserManagement';

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<PosTerminal />} />
            <Route path="reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportsDashboard />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProductManagement />
              </ProtectedRoute>
            } />
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
          </Route>

          {/* Catch all redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
