/**
 * @file Componente Modal Profissional e Reutilizável
 * @description Modal flexível com design minimalista, suporte a diferentes tamanhos,
 * animações suaves e controle completo de interação. Totalmente customizável.
 * 
 * @module componentes/Comum/Modal
 */

import '../../estilos/componentes/Comum/Modal.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const MODAL_TAMANHOS = {
  PEQUENO: 'sm',
  MEDIO: 'md',
  GRANDE: 'lg',
  EXTRA_GRANDE: 'xl',
};

const MODAL_DIMENSOES = {
  sm: '400px',
  md: '550px',
  lg: '800px',
  xl: '1000px',
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente Modal Profissional
 * 
 * Modal responsivo com header, body e footer opcionais. Design minimalista
 * com animações suaves. Suporta fechar ao clicar fora e diversos tamanhos.
 * 
 * @component
 * @param {boolean} aberto - Modal está visível?
 * @param {Function} onClose - Callback ao fechar o modal (obrigatório)
 * @param {string} [titulo] - Título do modal exibido no header
 * @param {ReactNode} [children] - Conteúdo principal do modal (body)
 * @param {ReactNode} [footer=null] - Conteúdo do footer (botões, etc)
 * @param {string} [tamanho='md'] - Tamanho: 'sm' (400px), 'md' (550px), 'lg' (800px), 'xl' (1000px)
 * @param {boolean} [allowOutsideClick=true] - Fechar ao clicar fora?
 * @param {boolean} [showCloseButton=true] - Mostrar botão fechar?
 * @param {Object} [props] - Props adicionais HTML
 * @returns {JSX.Element|null}
 * 
 * @example
 * <Modal
 *   aberto={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   titulo="Editar Dados"
 *   tamanho="lg"
 *   footer={<button onClick={save}>Salvar</button>}
 * >
 *   <form>{...}</form>
 * </Modal>
 */
const Modal = ({
  aberto,
  onClose,
  titulo,
  children,
  footer = null,
  tamanho = 'md',
  allowOutsideClick = true,
  showCloseButton = true,
  ...props
}) => {
  if (!aberto) return null;

  const handleBackdropClick = (e) => {
    if (allowOutsideClick && e.target.className === 'modal-backdrop-custom') {
      onClose();
    }
  };

  const dimensao = MODAL_DIMENSOES[tamanho] || MODAL_DIMENSOES.md;

  return (
    <>
      {/* Backdrop com transição */}
      <div
        className="modal-backdrop-custom"
        onClick={handleBackdropClick}
        role="presentation"
      ></div>

      {/* Container do Modal */}
      <div
        className="modal-container-custom"
        role="dialog"
        aria-labelledby="modalLabel"
        aria-hidden={!aberto}
        {...props}
      >
        {/* Conteúdo do Modal */}
        <div
          className={`modal-content-custom modal-${tamanho}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {titulo && (
            <div className="modal-header-custom">
              <h2 className="modal-title-custom" id="modalLabel">
                {titulo}
              </h2>
              {showCloseButton && (
                <button
                  className="modal-close-button-custom"
                  onClick={onClose}
                  aria-label="Fechar modal"
                  title="Fechar (Esc)"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="modal-body-custom">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="modal-footer-custom">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;
