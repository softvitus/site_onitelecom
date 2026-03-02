/**
 * @file Componente Alert para Exibição de Mensagens
 * @description Componente reutilizável para exibir alertas com tipos variados
 * (sucesso, erro, aviso, informação) com opção de fechar
 * 
 * @module componentes/Comum/Alert
 */

// ============================================================================
// CONSTANTES
// ============================================================================

const TIPOS_ALERTA = {
  SUCESSO: 'success',
  ERRO: 'danger',
  AVISO: 'warning',
  INFO: 'info',
};

const CLASSES_TIPO = {
  [TIPOS_ALERTA.SUCESSO]: 'alert-success',
  [TIPOS_ALERTA.ERRO]: 'alert-danger',
  [TIPOS_ALERTA.AVISO]: 'alert-warning',
  [TIPOS_ALERTA.INFO]: 'alert-info',
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente Alert para Exibição de Mensagens
 * 
 * Componente reutilizável baseado em Bootstrap com suporte a diferentes
 * tipos de alerta, título opcional e fechamento programático.
 * 
 * @component
 * @param {string} [tipo='info'] - Tipo de alerta: 'success', 'danger', 'warning', 'info'
 * @param {string} [titulo=''] - Título do alerta
 * @param {string} [mensagem=''] - Mensagem principal do alerta
 * @param {Function} [onClose=null] - Callback ao clicar no botão de fechar
 * @param {boolean} [dismissible=true] - Permite fechar o alerta?
 * @param {ReactNode} [children] - Conteúdo adicional dentro do alerta
 * @param {Object} [props] - Props adicionais do HTML
 * @returns {JSX.Element}
 * 
 * @example
 * <Alert
 *   tipo="success"
 *   titulo="Sucesso!"
 *   mensagem="Operação realizada com sucesso"
 *   dismissible={true}
 *   onClose={() => console.log('Alerta fechado')}
 * />
 */
const Alert = ({
  tipo = 'info',
  titulo = '',
  mensagem = '',
  onClose = null,
  dismissible = true,
  children,
  ...props
}) => {
  const tipoClass = CLASSES_TIPO[tipo] || CLASSES_TIPO[TIPOS_ALERTA.INFO];

  return (
    <div className={`alert ${tipoClass} ${dismissible ? 'alert-dismissible fade show' : ''}`.trim()} role="alert" {...props}>
      {titulo && <h4 className="alert-heading">{titulo}</h4>}
      {mensagem && <p>{mensagem}</p>}
      {children}
      
      {dismissible && onClose && (
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default Alert;
