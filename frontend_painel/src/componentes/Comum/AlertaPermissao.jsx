/**
 * @file Componente AlertaPermissao
 * @description Componente para mostrar alerta quando usuário não tem permissão
 */

import { FaLock } from 'react-icons/fa';
import '../../estilos/componentes/AlertaPermissao.css';

/**
 * Alerta de Permissão Insuficiente
 * @component
 * @param {Object} props
 * @param {string} props.titulo - Título do alerta
 * @param {string} props.mensagem - Mensagem do alerta
 * @param {string} props.permissaoNecessaria - Nome da permissão necessária
 * @param {string} props.tipo - Tipo de alerta: 'restricao' | 'bloqueado' | 'aviso'
 * @param {Function} props.onVoltar - Callback quando clica em voltar
 * @returns {JSX.Element}
 */
function AlertaPermissao({
  titulo = 'Acesso Restrito',
  mensagem = 'Você não tem permissão para acessar este recurso.',
  permissaoNecessaria,
  tipo = 'restricao',
  onVoltar,
}) {
  const handleVoltar = () => {
    if (onVoltar) {
      onVoltar();
    } else {
      window.history.back();
    }
  };

  return (
    <div className={`alerta-permissao alerta-${tipo}`}>
      <div className="card-alerta">
        <FaLock className="icone" />

        <h2>{titulo}</h2>
        <p className="mensagem">{mensagem}</p>

        {permissaoNecessaria && (
          <div className="detalhes">
            <p>
              Permissão necessária: <code>{permissaoNecessaria}</code>
            </p>
            <p className="dica">Entre em contato com um administrador para obter acesso.</p>
          </div>
        )}

        <div className="acoes">
          <button className="btn btn-voltar" onClick={handleVoltar}>
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertaPermissao;
