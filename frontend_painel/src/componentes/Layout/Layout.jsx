/**
 * @file Componente Layout Principal
 * @description Estrutura de layout com Header, Sidebar colapsível,
 * conteúdo principal e Footer
 * 
 * @module componentes/Layout/Layout
 */

import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../../estilos/componentes/layout/Layout.css';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente Layout
 * 
 * Estrutura principal da aplicação com header superior, sidebar lateral
 * colapsível e área de conteúdo central com footer.
 * 
 * @component
 * @param {ReactNode} children - Conteúdo principal da página
 * @returns {JSX.Element}
 * 
 * @example
 * <Layout>
 *   <ParceirosPage />
 * </Layout>
 */
const Layout = ({ children }) => {
  const [sidebarAberto, setSidebarAberto] = useState(true);

  const toggleSidebar = () => {
    setSidebarAberto(!sidebarAberto);
  };

  return (
    <div className="layout">
      <Header onToggleSidebar={toggleSidebar} sidebarAberto={sidebarAberto} />
      
      <div className="layout-container">
        <Sidebar aberto={sidebarAberto} />
        
        <div className="layout-main">
          <div className="layout-content">
            {children}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
