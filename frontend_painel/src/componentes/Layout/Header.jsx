/**
 * @file Componente Header - Barra de Navegação Superior
 * @description Navbar com logo, notificações, menu do usuário e toggle
 * para sidebar lateral
 * 
 * @module componentes/Layout/Header
 */

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaBars, FaSignOutAlt, FaCog, FaBell, FaChevronDown } from 'react-icons/fa';
import '../../estilos/componentes/layout/Header.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const HEADER_CONFIG = {
  LOGO_TEXTO: 'Site Oni',
  LOGO_SUBTITULO: 'Admin',
  NOTIFICACOES_INICIAL: 3,
  NOTIFICACOES_TIMEOUT: 500,
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente Header
 * 
 * Barra de navegação superior com logo, indicador de notificações,
 * menu dropdown do usuário e botão para toggle da sidebar.
 * 
 * @component
 * @param {Function} onToggleSidebar - Callback para alternar sidebar
 * @returns {JSX.Element}
 * 
 * @example
 * <Header onToggleSidebar={() => toggleSidebar()} />
 */
const Header = ({ onToggleSidebar }) => {
  const { usuario, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <header className="header">
      {/* Left Section */}
      <div className="header-left">
        <button className="header-toggle" onClick={onToggleSidebar} title="Menu">
          <FaBars size={18} />
        </button>
        
        <div className="header-logo">
          <span className="logo-text">{HEADER_CONFIG.LOGO_TEXTO}</span>
          <span className="logo-subtitle">{HEADER_CONFIG.LOGO_SUBTITULO}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="header-right">
        {/* Notifications */}
        <button className="header-icon-btn" title="Notificações">
          <FaBell size={16} />
          <span className="notification-badge">{HEADER_CONFIG.NOTIFICACOES_INICIAL}</span>
        </button>

        {/* User Menu Dropdown */}
        <div className="header-user-menu">
          <button
            className="header-user-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            title={usuario?.usr_nome || 'Usuário'}
          >
            <div className="user-avatar">
              {usuario?.usr_nome?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{usuario?.usr_nome || 'Usuário'}</span>
              <span className="user-role">{usuario?.rol_nome || 'Usuário'}</span>
            </div>
            <FaChevronDown size={12} className={`chevron ${menuOpen ? 'open' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item">
                <FaCog size={14} />
                <span>Configurações</span>
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <FaSignOutAlt size={14} />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
