import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PartidosPage } from './pages/PartidosPage';
import { PartidoDetailPage } from './pages/PartidoDetailPage';
import { ApuestasPage } from './pages/ApuestasPage';
import { SaldoPage } from './pages/SaldoPage';
import { ReportesPage } from './pages/ReportesPage';

// Componente para rutas protegidas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/partidos"
              element={
                <PrivateRoute>
                  <PartidosPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/partidos/:id"
              element={
                <PrivateRoute>
                  <PartidoDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/apuestas"
              element={
                <PrivateRoute>
                  <ApuestasPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/saldo"
              element={
                <PrivateRoute>
                  <SaldoPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/reportes"
              element={
                <PrivateRoute>
                  <ReportesPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
