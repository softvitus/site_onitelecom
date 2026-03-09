/**
 * @file Componente Sidebar - Menu Lateral
 * @description Menu lateral de navegação com itens organizados em seções
 * temáticas (Principal, Gerenciamento, Conteúdo, Configuração)
 * Filtra menus baseado nas permissões do usuário
 *
 * @module componentes/Layout/Sidebar
 */

import { useLocation, Link } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaPalette,
  FaFileAlt,
  FaCube,
  FaSquare,
  FaImage,
  FaLink,
  FaFont,
  FaBoxes,
  FaStar,
  FaCog,
  FaUser,
  FaLock,
  FaHistory,
  FaShieldAlt,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import '../../estilos/componentes/layout/Sidebar.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const MENU_SECTIONS = [
  {
    label: 'Principal',
    items: [{ path: '/dashboard', label: 'Dashboard', icon: FaHome, adminOnly: true }],
  },
  {
    label: 'Gerenciamento',
    items: [
      {
        path: '/parceiros',
        label: 'Parceiros',
        icon: FaUsers,
        requiredPermission: 'parceiro_listar',
      },
      { path: '/temas', label: 'Temas', icon: FaPalette, requiredPermission: 'tema_listar' },
      { path: '/paginas', label: 'Páginas', icon: FaFileAlt, requiredPermission: 'pagina_listar' },
      {
        path: '/componentes',
        label: 'Componentes',
        icon: FaCube,
        requiredPermission: 'componente_listar',
      },
    ],
  },
  {
    label: 'Conteúdo',
    items: [
      {
        path: '/elementos',
        label: 'Elementos',
        icon: FaSquare,
        requiredPermission: 'elemento_listar',
      },
      { path: '/imagens', label: 'Imagens', icon: FaImage, requiredPermission: 'imagens_listar' },
      { path: '/links', label: 'Links', icon: FaLink, requiredPermission: 'links_listar' },
      { path: '/textos', label: 'Textos', icon: FaFont, requiredPermission: 'textos_listar' },
      {
        path: '/conteudo',
        label: 'Conteúdo',
        icon: FaBoxes,
        requiredPermission: 'conteudo_listar',
      },
    ],
  },
  {
    label: 'Configuração',
    items: [
      { path: '/cores', label: 'Cores', icon: FaSquare, requiredPermission: 'cores_listar' },
      { path: '/features', label: 'Features', icon: FaStar, requiredPermission: 'features_listar' },
      { path: '/usuarios', label: 'Usuários', icon: FaUser, requiredPermission: 'usuario_listar' },
      { path: '/permissoes', label: 'Permissões', icon: FaLock, adminOnly: true },
      {
        path: '/role-permissoes',
        label: 'Permissões de Função',
        icon: FaShieldAlt,
        adminOnly: true,
      },
      { path: '/configuracoes', label: 'Configurações', icon: FaCog, adminOnly: true },
      {
        path: '/auditoria',
        label: 'Auditoria',
        icon: FaHistory,
        requiredPermission: 'auditoria_listar',
      },
    ],
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
 * Filtra itens baseado nas permissões do usuário.
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
  const { temPermissao, usuario } = useAuth();

  const isActive = (path) => location.pathname === path;

  /**
   * Verifica se o item de menu deve ser exibido
   * @param {Object} item - Item de menu
   * @returns {boolean} True se deve exibir
   */
  const podeVerItem = (item) => {
    // Se é admin-only, apenas admin pode ver
    if (item.adminOnly) {
      return usuario?.usu_tipo === 'admin';
    }

    // Se não requer permissão específica, deixa passar
    if (!item.requiredPermission) {
      return true;
    }

    // Verificar se tem a permissão necessária
    return temPermissao(item.requiredPermission);
  };

  // Se sidebar está fechado, não renderiza nada
  if (!aberto) {
    return null;
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {MENU_SECTIONS.map((section) => {
          // Filtrar itens visíveis para esta seção
          const itensVisiveis = section.items.filter(podeVerItem);

          // Não renderizar seção se não houver itens visíveis
          if (itensVisiveis.length === 0) {
            return null;
          }

          return (
            <div key={section.label} className="sidebar-section">
              <div className="sidebar-section-label">{section.label}</div>
              <ul className="sidebar-menu">
                {itensVisiveis.map((item) => {
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
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
