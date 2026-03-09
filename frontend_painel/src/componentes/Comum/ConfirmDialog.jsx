/**
 * @file Componente Dialog de Confirmação
 * @description Modal reutilizável para confirmações com design profissional
 * Substitui confirm() nativo por uma interface mais elegante
 *
 * @module componentes/Comum/ConfirmDialog
 */

import { FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';
import Modal from './Modal';
import '../../estilos/componentes/Comum/ConfirmDialog.css';

// ============================================================================
// TIPOS DE CONFIRMAÇÃO
// ============================================================================

const TIPOS_CONFIRMACAO = {
  PERIGO: 'perigo',
  AVISO: 'aviso',
  INFO: 'info',
  SUCESSO: 'sucesso',
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Dialog de Confirmação
 *
 * Componente modal profissional para confirmar ações críticas.
 * Substitui o confirm() nativo do navegador com design mais elegante.
 *
 * @component
 * @param {boolean} aberto - Se o dialog está aberto
 * @param {string} titulo - Título do dialog
 * @param {string} mensagem - Mensagem de confirmação
 * @param {string} tipo - Tipo de confirmação (perigo, aviso, info, sucesso)
 * @param {Function} onConfirmar - Callback quando usuário confirma
 * @param {Function} onCancelar - Callback quando usuário cancela
 * @param {string} textoBotaoConfirmar - Texto do botão confirmar (padrão: Confirmar)
 * @param {string} textoBotaoCancelar - Texto do botão cancelar (padrão: Cancelar)
 * @param {boolean} carregando - Se está carregando (desabilita botão confirmar)
 * @returns {JSX.Element}
 *
 * @example
 * <ConfirmDialog
 *   aberto={showDialog}
 *   titulo="Inativar Parceiro?"
 *   mensagem="Tem certeza que deseja inativar Arthur Nobrega? Esta ação não pode ser desfeita."
 *   tipo="perigo"
 *   onConfirmar={handleConfirmar}
 *   onCancelar={handleCancelar}
 *   textoBotaoConfirmar="Inativar"
 * />
 */
const ConfirmDialog = ({
  aberto = false,
  titulo = 'Confirmar ação?',
  mensagem = '',
  tipo = TIPOS_CONFIRMACAO.AVISO,
  onConfirmar = () => {},
  onCancelar = () => {},
  textoBotaoConfirmar = 'Confirmar',
  textoBotaoCancelar = 'Cancelar',
  carregando = false,
}) => {
  const obterIcone = () => {
    switch (tipo) {
      case TIPOS_CONFIRMACAO.PERIGO:
      case TIPOS_CONFIRMACAO.AVISO:
        return <FaExclamationTriangle />;
      case TIPOS_CONFIRMACAO.SUCESSO:
        return <FaCheck />;
      default:
        return <FaExclamationTriangle />;
    }
  };

  return (
    <Modal
      aberto={aberto}
      onClose={onCancelar}
      titulo={titulo}
      tamanho="sm"
      allowOutsideClick={!carregando}
      showCloseButton={!carregando}
      footer={
        <div className="confirm-dialog-footer">
          <button
            className="confirm-dialog-btn-cancelar"
            onClick={onCancelar}
            disabled={carregando}
          >
            {textoBotaoCancelar}
          </button>
          <button
            className={`confirm-dialog-btn-confirmar confirm-dialog-${tipo}`}
            onClick={onConfirmar}
            disabled={carregando}
          >
            {carregando ? 'Processando...' : textoBotaoConfirmar}
          </button>
        </div>
      }
    >
      <div className={`confirm-dialog-content confirm-dialog-${tipo}`}>
        <div className="confirm-dialog-icon">{obterIcone()}</div>
        <p className="confirm-dialog-message">{mensagem}</p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
export { TIPOS_CONFIRMACAO };
