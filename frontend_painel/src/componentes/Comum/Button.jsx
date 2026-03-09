/**
 * @file Componente Button Reutilizável
 * @description Botão customizável com suporte a variantes, tamanhos,
 * estado de carregamento e desabilitado
 *
 * @module componentes/Comum/Button
 */

import '../../estilos/componentes/comuns/Button.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
};

const BUTTON_SIZES = {
  PEQUENO: 'sm',
  MEDIO: 'md',
  GRANDE: 'lg',
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente Button Reutilizável
 *
 * Botão flexível com suporte a múltiplas variantes, tamanhos e estados.
 * Integrado com Bootstrap para consistência visual.
 *
 * @component
 * @param {string} [variant='primary'] - Variante visual: 'primary', 'secondary', 'success', 'danger', 'warning', 'info'
 * @param {string} [size='md'] - Tamanho: 'sm', 'md', 'lg'
 * @param {boolean} [disabled=false] - Desabilitar botão
 * @param {boolean} [loading=false] - Mostrar spinner de carregamento
 * @param {Function} [onClick] - Callback ao clicar
 * @param {ReactNode} [children] - Conteúdo do botão
 * @param {string} [className=''] - Classes CSS adicionais
 * @param {string} [type='button'] - Tipo do botão: 'button', 'submit', 'reset'
 * @returns {JSX.Element}
 *
 * @example
 * <Button variant="success" size="lg" onClick={() => handleSave()}>
 *   Salvar
 * </Button>
 *
 * @example
 * <Button variant="danger" loading={isSaving}>
 *   {isSaving ? 'Salvando...' : 'Salvar'}
 * </Button>
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  type = 'button',
}) => {
  const sizeClass = size !== BUTTON_SIZES.MEDIO ? `btn-${size}` : '';
  const buttonClass = `btn btn-${variant} ${sizeClass} ${className}`.trim();

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={buttonClass}>
      {loading && (
        <span
          className="spinner-border spinner-border-sm"
          style={{ marginRight: '0.5rem' }}
          role="status"
          aria-hidden="true"
        ></span>
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;
