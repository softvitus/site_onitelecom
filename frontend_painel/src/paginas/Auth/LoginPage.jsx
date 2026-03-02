/**
 * @file Página de Login
 * @description Interface de autenticação para acesso à plataforma.
 * Valida email e senha, com opção de visibilidade de senha e
 * tratamento de erros de autenticação.
 * 
 * @module paginas/Auth/LoginPage
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../componentes/Comum/Button';
import Alert from '../../componentes/Comum/Alert';
import { MdEmail, MdLock, MdErrorOutline, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import '../../estilos/paginas/LoginPage.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TAMANHO_MINIMO_SENHA = 6;
const ROTA_POS_LOGIN = '/dashboard';

const MENSAGENS_VALIDACAO = {
  EMAIL_OBRIGATORIO: 'Email é obrigatório',
  EMAIL_INVALIDO: 'Email inválido',
  SENHA_OBRIGATORIA: 'Senha é obrigatória',
  SENHA_MINIMA: `Senha deve ter no mínimo ${TAMANHO_MINIMO_SENHA} caracteres`,
};

const MENSAGENS_ERRO = {
  LOGIN_FALHOU: 'Falha ao fazer login. Verifique suas credenciais.',
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Valida o email
 * @param {string} email - Email a validar
 * @returns {string|null} Mensagem de erro ou null se válido
 */
const validarEmail = (email) => {
  if (!email) return MENSAGENS_VALIDACAO.EMAIL_OBRIGATORIO;
  if (!REGEX_EMAIL.test(email)) return MENSAGENS_VALIDACAO.EMAIL_INVALIDO;
  return null;
};

/**
 * Valida a senha
 * @param {string} senha - Senha a validar
 * @returns {string|null} Mensagem de erro ou null se válida
 */
const validarSenha = (senha) => {
  if (!senha) return MENSAGENS_VALIDACAO.SENHA_OBRIGATORIA;
  if (senha.length < TAMANHO_MINIMO_SENHA) return MENSAGENS_VALIDACAO.SENHA_MINIMA;
  return null;
};

/**
 * Valida email e senha
 * @param {string} email - Email a validar
 * @param {string} senha - Senha a validar
 * @returns {Object} Dicionário de erros
 */
const validarFormularioLogin = (email, senha) => {
  const erros = {};
  const erroEmail = validarEmail(email);
  const erroSenha = validarSenha(senha);
  
  if (erroEmail) erros.email = erroEmail;
  if (erroSenha) erros.senha = erroSenha;
  
  return erros;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página de Login
 * 
 * Interface de autenticação que permite ao usuário fazer login com
 * email e senha. Inclui validação em tempo real, visibilidade de senha
 * e tratamento de erros de autenticação.
 * 
 * @component
 * @returns {JSX.Element}
 * 
 * @example
 * <LoginPage />
 */
function LoginPage() {
  const navigate = useNavigate();
  const { login, carregando, erro } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostraSenha, setMostraSenha] = useState(false);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroGeral(null);

    const novosErros = validarFormularioLogin(email, senha);
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    const sucesso = await login(email, senha);

    if (sucesso) {
      navigate(ROTA_POS_LOGIN);
    } else {
      setErroGeral(erro || MENSAGENS_ERRO.LOGIN_FALHOU);
    }
  };

  return (
    <div className="login-page">
      {/* Decorações de Fundo */}
      <div className="login-blob login-blob-1"></div>
      <div className="login-blob login-blob-2"></div>
      <div className="login-blob login-blob-3"></div>

      <div className="login-wrapper">
        {/* Lado Esquerdo - Formulário */}
        <div className="login-left">
          <div className="login-form-container">
            {/* Header */}
            <div className="login-form-header">
              <p className="login-welcome-text">Bem-vindo ao</p>
              <h1 className="login-form-title">
                <span className="text-primary">LOGIN</span>
              </h1>
              <p className="login-form-subtitle">
                Preencha os dados a seguir para acessar
              </p>
            </div>

            {/* Erro Geral */}
            {erroGeral && (
              <Alert
                tipo="danger"
                mensagem={erroGeral}
                onClose={() => setErroGeral(null)}
              />
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Email */}
              <div className="login-form-group">
                <label htmlFor="email" className="login-form-label">
                Usuário / email
                </label>
                <div className="login-input-wrapper">
                  <MdEmail className="login-input-icon" />
                  <input
                    type="email"
                    className={`login-form-input ${erros.email ? 'is-invalid' : ''}`}
                    id="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (erros.email) setErros({ ...erros, email: null });
                    }}
                    disabled={carregando}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {erros.email && (
                  <div className="login-error-message">
                    <MdErrorOutline /> {erros.email}
                  </div>
                )}
              </div>

              {/* Senha */}
              <div className="login-form-group">
                <label htmlFor="senha" className="login-form-label">
                Senha
                </label>
                <div className="login-input-wrapper">
                  <MdLock className="login-input-icon" />
                  <input
                    type={mostraSenha ? 'text' : 'password'}
                    className={`login-form-input ${erros.senha ? 'is-invalid' : ''}`}
                    id="senha"
                    placeholder="Insira sua senha"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      if (erros.senha) setErros({ ...erros, senha: null });
                    }}
                    disabled={carregando}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-toggle-password"
                    onClick={() => setMostraSenha(!mostraSenha)}
                    disabled={carregando}
                    title={mostraSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {mostraSenha ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
                {erros.senha && (
                  <div className="login-error-message">
                    <MdErrorOutline /> {erros.senha}
                  </div>
                )}
              </div>

              {/* Botão Entrar */}
              <Button
                variant="primary"
                type="submit"
                className="login-submit-btn"
                disabled={carregando}
                loading={carregando}
              >
                {carregando ? 'ENTRANDO...' : 'ENTRAR'}
              </Button>
            </form>
          </div>
        </div>

        {/* Lado Direito - Conteúdo */}
        <div className="login-right">
          <div className="login-right-content">
            <h2 className="login-right-title">
              Faça o login em nossa
              <br />
              <span className="login-highlight">Plataforma</span>
            </h2>
            <p className="login-right-subtitle">
              Acesse todas as funcionalidades e gerencie seus parceiros
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
