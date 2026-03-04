import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../servicos/auth';

/**
 * Context para autenticação e permissões
 * Fornece dados do usuário, token, permissões e funções de autenticação
 */
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [permissoes, setPermissoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [erro, setErro] = useState(null);

  /**
   * Verificar autenticação ao montar o componente
   */
  useEffect(() => {
    const verificarAutenticacao = async () => {
      const token = localStorage.getItem('authToken');
      const userStored = localStorage.getItem('user');

      if (token && userStored) {
        try {
          // Tentar obter permissões (isso valida o token automaticamente)
          const perms = await authService.obterPermissoes();
          
          // Se conseguiu permissões, token é válido
          setUsuario(JSON.parse(userStored));
          setAutenticado(true);
          setPermissoes(perms);
          localStorage.setItem('permissoes', JSON.stringify(perms));
        } catch (err) {
          console.error('Erro ao verificar autenticação:', err);
          // Token inválido ou expirado
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('permissoes');
          setAutenticado(false);
        }
      }

      setCarregando(false);
    };

    verificarAutenticacao();
  }, []);

  /**
   * Fazer login
   * @param {string} email
   * @param {string} senha
   * @returns {boolean} Sucesso
   */
  const login = useCallback(async (email, senha) => {
    setCarregando(true);
    setErro(null);

    const resultado = await authService.login(email, senha);

    if (resultado.sucesso) {
      setUsuario(resultado.usuario);
      setAutenticado(true);

      // Obter e armazenar permissões
      const perms = await authService.obterPermissoes();
      setPermissoes(perms);
      localStorage.setItem('permissoes', JSON.stringify(perms));

      setCarregando(false);
      return true;
    } else {
      setErro(resultado.erro);
      setCarregando(false);
      return false;
    }
  }, []);

  /**
   * Fazer logout
   */
  const logout = useCallback(async () => {
    setCarregando(true);

    await authService.logout();

    setUsuario(null);
    setPermissoes([]);
    setAutenticado(false);
    setErro(null);
    setCarregando(false);

    navigate('/login');
  }, [navigate]);

  /**
   * Verificar se usuário tem uma permissão
   * @param {string} permissao - Nome da permissão
   * @returns {boolean} Verdadeiro se tem permissão
   */
  const temPermissao = useCallback(
    (permissao) => {
      return permissoes.includes(permissao);
    },
    [permissoes]
  );

  /**
   * Verificar se usuário tem alguma das permissões
   * @param {Array} permissoes - Lista de permissões
   * @returns {boolean} Verdadeiro se tem alguma
   */
  const temAlgumaPermissao = useCallback(
    (perms) => {
      return perms.some((perm) => permissoes.includes(perm));
    },
    [permissoes]
  );

  const value = {
    usuario,
    permissoes,
    autenticado,
    carregando,
    erro,
    login,
    logout,
    temPermissao,
    temAlgumaPermissao,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
/**
 * Hook para usar AuthContext
 * @returns {Object} Objeto com dados de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
