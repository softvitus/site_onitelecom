/**
 * @fileoverview Componente DivisorSecao - Elemento visual divisor entre seções
 * @component
 * @description
 * Renderiza um divisor visual decorativo com:
 * - Elemento de bolinhas decorativas
 * - Título centralizado
 * - Separação visual entre seções
 * @returns {React.ReactElement} Divisor de seção estilizado
 */

import React from 'react';
import styles from '../../estilos/componentes/comuns/DivisorSecao.module.css';
import { getTexto } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} Classe base do componente */
const BASE_CLASS = 'divisor-secao';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém o título do divisor do tema
 * @returns {string} Título do divisor
 */
const getDivisorTitulo = () => getTexto('divisorSecao', 'titulo', '');

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * DecorativeDots - Elemento visual decorativo com bolinhas
 * @returns {React.ReactElement}
 */
const DecorativeDots = () => <div className={styles['bolinhas-divisor']} aria-hidden="true" />;

/**
 * DivisorTitle - Título do divisor
 * @param {Object} props - Props do componente
 * @param {string} props.titulo - Texto do título
 * @returns {React.ReactElement}
 */
const DivisorTitle = ({ titulo }) => (
  <h3>
    {titulo}
  </h3>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente DivisorSecao - Divisor visual entre seções
 * @returns {React.ReactElement}
 */
const DivisorSecao = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const titulo = getDivisorTitulo();

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <div className={styles[BASE_CLASS]} role="separator" aria-orientation="horizontal">
      {/* Decoração Visual */}
      <DecorativeDots />

      {/* Título */}
      <DivisorTitle titulo={titulo} />
    </div>
  );
};

export default DivisorSecao;
