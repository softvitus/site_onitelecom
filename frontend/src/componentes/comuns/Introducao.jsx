/**
 * @fileoverview Componente Introducao - Seção introdutória com título e descrição
 * @component
 * @description
 * Renderiza uma seção de introdução simples com:
 * - Título centralizado
 * - Descrição/lead text
 * - Layout responsivo Bootstrap
 * @returns {React.ReactElement} Seção de introdução
 */

import React from 'react';
import styles from '../../estilos/componentes/comuns/Introducao.module.css';
import { getTexto } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const SECTION_ID = 'introducao';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém os textos da introdução do tema
 * @returns {Object} {title, description}
 */
const getIntroducaoTexts = () => ({
  title: getTexto('introducao', 'title', ''),
  description: getTexto('introducao', 'description', ''),
});

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * IntroducaoTitle - Título da seção
 * @param {Object} props - Props do componente
 * @param {string} props.title - Texto do título
 * @returns {React.ReactElement}
 */
const IntroducaoTitle = ({ title }) => (
  <h2 className={styles['texto-oni-azul']} role="heading" aria-level="2">
    {title}
  </h2>
);

/**
 * IntroducaoDescription - Descrição da seção
 * @param {Object} props - Props do componente
 * @param {string} props.description - Texto da descrição
 * @returns {React.ReactElement}
 */
const IntroducaoDescription = ({ description }) => (
  <p className="lead" role="contentinfo">
    {description}
  </p>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente Introducao - Seção introdutória
 * @returns {React.ReactElement}
 */
const Introducao = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const { title, description } = getIntroducaoTexts();

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <section
      id={SECTION_ID}
      className={styles['secao']}
      role="region"
      aria-labelledby="introducao-title"
    >
      <div className="container">
        <div className="row">
          <div className="col-md-8 mx-auto text-center">
            {/* Título */}
            <IntroducaoTitle title={title} />

            {/* Descrição */}
            <IntroducaoDescription description={description} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Introducao;
