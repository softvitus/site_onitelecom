import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { BrandingProvider, useBrandingContext } from './contexts/BrandingContext';
import { getTemaPaginas } from './servicos/tema';
import Loading from './componentes/personalizados/Loading';
import ErrorBoundary from './componentes/ErrorBoundary/ErrorBoundary';

// Importações de páginas com lazy loading para melhor performance
const LocationSelectionModal = lazy(
  () => import('./componentes/personalizados/LocationSelectionModal')
);
const Inicio = lazy(() => import('./paginas/Inicio/Inicio'));
const QuemSomos = lazy(() => import('./paginas/Inicio/QuemSomos'));
const OfertasChips = lazy(() => import('./paginas/Inicio/OfertasChips'));
const Entretenimento = lazy(() => import('./paginas/Inicio/Entretenimento'));
const Planos = lazy(() => import('./paginas/Inicio/Planos'));
const Internet = lazy(() => import('./paginas/Inicio/Internet'));
const Empresas = lazy(() => import('./paginas/Inicio/Empresas'));
const MonteSeuPlano = lazy(() => import('./paginas/Inicio/MonteSeuPlano'));
const Perguntas = lazy(() => import('./paginas/Inicio/Perguntas'));
const Carrinho = lazy(() => import('./componentes/comuns/Carrinho'));

/**
 * Mapeia nomes de páginas para componentes React
 * Manter sincronizado com os nomes de páginas no backend
 */
const componentMap = {
  inicio: Inicio,
  quemSomos: QuemSomos,
  ofertasChips: OfertasChips,
  entretenimento: Entretenimento,
  planos: Planos,
  internet: Internet,
  empresas: Empresas,
  monteSeuPlano: MonteSeuPlano,
  faq: Perguntas,
  carrinho: Carrinho,
};

/**
 * Carrega as páginas disponíveis para o parceiro
 * As páginas vêm da API via tema.js
 */
const loadAvailablePages = () => {
  const paginasAPI = getTemaPaginas();

  if (paginasAPI.length > 0) {
    return paginasAPI.map((pagina) => ({
      key: pagina.nome,
      path: pagina.caminho,
    }));
  }

  // Fallback: array vazio (páginas vêm da API)
  return [];
};

/**
 * Componente que protege o acesso a páginas
 * Bloqueia acesso direto via URL a páginas não disponíveis
 */
const ProtectedPageComponent = ({ component: Component, pagePath, availablePages }) => {
  // Normaliza o caminho para minúsculas para comparação (API pode retornar em PascalCase)
  const pathNormalizado = pagePath.toLowerCase();
  const isPageAvailable = availablePages.some((p) => p.path.toLowerCase() === pathNormalizado);

  if (!isPageAvailable) {
    return <Navigate to="/entrada" replace />;
  }

  return <Component />;
};

/**
 * Renderiza as rotas de página com proteção
 * Bloqueia acesso direto a páginas não disponíveis
 */
const renderPageRoutes = (pages) => {
  return pages.map((pageConfig) => {
    const PageComponent = componentMap[pageConfig.key];

    if (!PageComponent) {
      return null;
    }

    return (
      <Route
        key={pageConfig.key}
        path={pageConfig.path}
        element={
          <ProtectedPageComponent
            component={PageComponent}
            pagePath={pageConfig.path}
            availablePages={pages}
          />
        }
      />
    );
  });
};

/**
 * Componente que renderiza as rotas dinâmicas
 * Carrega apenas as páginas disponíveis para o parceiro selecionado
 */
const DynamicRouter = () => {
  const { loading } = useBrandingContext();

  if (loading) {
    return <Loading />;
  }

  const pages = loadAvailablePages();

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/entrada" element={<LocationSelectionModal />} />
        {renderPageRoutes(pages)}
        <Route
          path="*"
          element={
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h2>Página não encontrada</h2>
              <p>A página que você procura não está disponível.</p>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
};

/**
 * Componente raiz da aplicação
 * Fornece contexto de branding globalmente e renderiza rotas
 */
function App() {
  return (
    <ErrorBoundary>
      <BrandingProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <DynamicRouter />
        </Router>
      </BrandingProvider>
    </ErrorBoundary>
  );
}

export default App;
