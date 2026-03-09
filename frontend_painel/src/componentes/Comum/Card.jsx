/**
 * @file Componente Card Reutilizável
 * @description Componente Card baseado em Bootstrap com suporte a header,
 * body, footer e classes customizadas
 *
 * @module componentes/Comum/Card
 */

// ============================================================================
// CONSTANTES
// ============================================================================

const CARD_CONFIG = {
  CLASSE_BASE: 'card',
  CLASSE_HEADER: 'card-header bg-light',
  CLASSE_BODY: 'card-body',
  CLASSE_FOOTER: 'card-footer bg-light',
  CLASSE_TITULO: 'card-title mb-0',
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente Card
 *
 * Wrapper flexível do componente card do Bootstrap com seções opcionais
 * (header com título, body e footer).
 *
 * @component
 * @param {string} [titulo] - Título do card (exibido no header)
 * @param {ReactNode} [children] - Conteúdo principal do card
 * @param {string} [className=''] - Classes CSS adicionais
 * @param {ReactNode} [footer=null] - Conteúdo do footer
 * @param {Object} [props] - Props adicionais do HTML
 * @returns {JSX.Element}
 *
 * @example
 * <Card titulo="Informações" footer={<button>OK</button>}>
 *   <p>Conteúdo do card</p>
 * </Card>
 */
const Card = ({ titulo, children, className = '', footer = null, ...props }) => {
  return (
    <div className={`${CARD_CONFIG.CLASSE_BASE} ${className}`.trim()} {...props}>
      {titulo && (
        <div className={CARD_CONFIG.CLASSE_HEADER}>
          <h5 className={CARD_CONFIG.CLASSE_TITULO}>{titulo}</h5>
        </div>
      )}
      <div className={CARD_CONFIG.CLASSE_BODY}>{children}</div>
      {footer && <div className={CARD_CONFIG.CLASSE_FOOTER}>{footer}</div>}
    </div>
  );
};

export default Card;
