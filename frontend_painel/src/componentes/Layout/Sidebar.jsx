/**
 * @file Componente Sidebar - Menu Lateral
 * @description Menu lateral de navegação com itens organizados em seções
 * temáticas (Principal, Gerenciamento, Conteúdo, Configuração)
 * 
 * @module componentes/Layout/Sidebar
 */

import { useLocation, Link } from 'react-router-dom';
import { FaHome, FaUsers, FaPalette, FaFileAlt, FaCubes, FaSquare, FaImage, FaLink, FaFont, FaBoxes, FaStar, FaCog, FaUser, FaLock, FaHistory } from 'react-icons/fa';
import '../../estilos/componentes/layout/Sidebar.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const MENU_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    ],
  },
  {
    label: 'Gerenciamento',
    items: [
      { path: '/parceiros', label: 'Parceiros', icon: FaUsers },
      { path: '/temas', label: 'Temas', icon: FaPalette },
      { path: '/paginas', label: 'Páginas', icon: FaFileAlt },
      { path: '/componentes', label: 'Componentes', icon: FaCubes },
    ],
  },
  {
    label: 'Conteúdo',
    items: [
      { path: '/elementos', label: 'Elementos', icon: FaSquare },
      { path: '/imagens', label: 'Imagens', icon: FaImage },
      { path: '/links', label: 'Links', icon: FaLink },
      { path: '/textos', label: 'Textos', icon: FaFont },
      { path: '/conteudo', label: 'Conteúdo', icon: FaBoxes },
    ],
  },
  {
    label: 'Configuração',
    items: [
      { path: '/cores', label: 'Cores', icon: FaSquare },
      { path: '/features', label: 'Features', icon: FaStar },
      { path: '/usuarios', label: 'Usuários', icon: FaUser },
      { path: '/permissoes', label: 'Permissões', icon: FaLock },
      { path: '/configuracoes', label: 'Configurações', icon: FaCog },      { path: '/auditoria', label: 'Auditoria', icon: FaHistory },    ],
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente Sidebar
 * 
 * Menu lateral colapsível com itens de navegação organizados em seções.
 * Destaca o item ativo baseado na rota atual.
 * 
 * @component
 * @param {boolean} aberto - Sidebar está visível?
 * @returns {JSX.Element|null}
 * 
 * @example
 * <Sidebar aberto={sidebarAberto} />
 */
const Sidebar = ({ aberto }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Se sidebar está fechado, não renderiza nada
  if (!aberto) {
    return null;
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {MENU_SECTIONS.map((section) => (
          <div key={section.label} className="sidebar-section">
            <div className="sidebar-section-label">{section.label}</div>
            <ul className="sidebar-menu">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path} className="sidebar-menu-item">
                    <Link
                      to={item.path}
                      className={`sidebar-menu-link ${isActive(item.path) ? 'active' : ''}`}
                      title={item.label}
                    >
                      <Icon className="sidebar-icon" />
                      <span className="sidebar-label">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
