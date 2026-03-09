import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contextos/AuthContext';
import { BrandingProvider } from './contextos/BrandingContext';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './componentes/personalizados/ErrorBoundary';
import Layout from './componentes/Layout/Layout';
import LoginPage from './paginas/Auth/LoginPage';
import DashboardPage from './paginas/Dashboard/DashboardPage';
import ParceirosPage from './paginas/Parceiros/ParceirosPage';
import ComponentesPage from './paginas/Componentes/ComponentesPage';
import ElementosPage from './paginas/Elementos/ElementosPage';
import ImagensPage from './paginas/Imagens/ImagensPage';
import LinksPage from './paginas/Links/LinksPage';
import TextosPage from './paginas/Textos/TextosPage';
import ConteudoPage from './paginas/Conteudo/ConteudoPage';
import CoresPage from './paginas/Cores/CoresPage';
import FeaturesPage from './paginas/Features/FeaturesPage';
import TemasPage from './paginas/Temas/TemasPage';
import PaginasPage from './paginas/Paginas/PaginasPage';
import AuditoriaPage from './paginas/Auditoria/AuditoriaPage';
import UsuariosPage from './paginas/Usuarios/UsuariosPage';
import PermissoesPage from './paginas/Permissoes/PermissoesPage';
import RolePermissoesPage from './paginas/RolePermissoes/RolePermissoesPage';

/**
 * Componente ProtectedRoute
 * Verifica autenticação antes de acessar rotas protegidas
 */
const ProtectedRoute = ({ element }) => {
  const { autenticado, carregando } = useAuth();

  if (carregando) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
        }}
      >
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #e9ecef',
              borderTop: '4px solid #0d6efd',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
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
          <BrandingProvider>
            <Routes>
              {/* Rota de Login */}
              <Route path="/login" element={<LoginPage />} />

              {/* Rotas Protegidas */}
              <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
              <Route path="/parceiros" element={<ProtectedRoute element={<ParceirosPage />} />} />
              <Route
                path="/componentes"
                element={<ProtectedRoute element={<ComponentesPage />} />}
              />
              <Route path="/elementos" element={<ProtectedRoute element={<ElementosPage />} />} />
              <Route path="/imagens" element={<ProtectedRoute element={<ImagensPage />} />} />
              <Route path="/links" element={<ProtectedRoute element={<LinksPage />} />} />
              <Route path="/textos" element={<ProtectedRoute element={<TextosPage />} />} />
              <Route path="/conteudo" element={<ProtectedRoute element={<ConteudoPage />} />} />
              <Route path="/cores" element={<ProtectedRoute element={<CoresPage />} />} />
              <Route path="/features" element={<ProtectedRoute element={<FeaturesPage />} />} />
              <Route path="/temas" element={<ProtectedRoute element={<TemasPage />} />} />
              <Route path="/paginas" element={<ProtectedRoute element={<PaginasPage />} />} />
              <Route path="/auditoria" element={<ProtectedRoute element={<AuditoriaPage />} />} />
              <Route path="/usuarios" element={<ProtectedRoute element={<UsuariosPage />} />} />
              <Route path="/permissoes" element={<ProtectedRoute element={<PermissoesPage />} />} />
              <Route
                path="/role-permissoes"
                element={<ProtectedRoute element={<RolePermissoesPage />} />}
              />

              {/* Redirecionar para dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Rota 404 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrandingProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
