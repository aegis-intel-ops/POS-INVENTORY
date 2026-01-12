import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import PosTerminal from './pages/PosTerminal';
import ReportsDashboard from './pages/ReportsDashboard';
import ProductManagement from './pages/ProductManagement';

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
            <Route path="reports" element={<ReportsDashboard />} />
            <Route path="settings" element={<ProductManagement />} />
          </Route>

          {/* Catch all redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
