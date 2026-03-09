/**
 * @file Componente Header - Barra de Navegação Superior
 * @description Navbar com logo, notificações, menu do usuário e toggle
 * para sidebar lateral
 *
 * @module componentes/Layout/Header
 */

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBreanding } from '../../contextos/BrandingContext';
import { FaBars, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import '../../estilos/componentes/layout/Header.css';

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
  const { _logo, _nomeParceiro, _loading } = useBreanding();
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
      </div>
      {/* Right Section */}
      <div className="header-right">
        {/* User Menu Dropdown */}
        <div className="header-user-menu">
          <button
            className="header-user-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            title={usuario?.usu_nome || 'Usuário'}
          >
            <div className="user-avatar">{usuario?.usu_nome?.charAt(0).toUpperCase() || 'U'}</div>
            <div className="user-info">
              <span className="user-name">{usuario?.usu_nome || 'Usuário'}</span>
              <span className="user-role">{usuario?.usu_tipo || 'Usuário'}</span>
            </div>
            <FaChevronDown size={12} className={`chevron ${menuOpen ? 'open' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="dropdown-menu">
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
