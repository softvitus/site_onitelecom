import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contextos/AuthContext';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './componentes/personalizados/ErrorBoundary';
import Layout from './componentes/Layout/Layout';
import LoginPage from './paginas/Auth/LoginPage';
import DashboardPage from './paginas/Dashboard/DashboardPage';
import ParceirosPage from './paginas/Parceiros/ParceirosPage';
import TemasPage from './paginas/Temas/TemasPage';
import PaginasPage from './paginas/Paginas/PaginasPage';
import AuditoriaPage from './paginas/Auditoria/AuditoriaPage';

/**
 * Componente ProtectedRoute
 * Verifica autenticação antes de acessar rotas protegidas
 */
const ProtectedRoute = ({ element }) => {
  const { autenticado, carregando } = useAuth();

  if (carregando) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #e9ecef',
            borderTop: '4px solid #0d6efd',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#6c757d' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{element}</Layout>;
};

/**
 * Componente principal da aplicação
 */
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rota de Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rotas Protegidas */}
            <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
            <Route path="/parceiros" element={<ProtectedRoute element={<ParceirosPage />} />} />
            <Route path="/temas" element={<ProtectedRoute element={<TemasPage />} />} />
            <Route path="/paginas" element={<ProtectedRoute element={<PaginasPage />} />} />
            <Route path="/auditoria" element={<ProtectedRoute element={<AuditoriaPage />} />} />

            {/* Redirecionar para dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Rota 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
