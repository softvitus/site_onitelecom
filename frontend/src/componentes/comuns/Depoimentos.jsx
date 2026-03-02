/**
 * @fileoverview Componente Depoimentos - Exibe depoimentos de clientes
 * @component
 * @description
 * Renderiza uma seção de depoimentos com:
 * - Título da seção
 * - Citação em destaque
 * - Informações do autor (nome e localização)
 * @returns {React.ReactElement} Seção de depoimentos
 */

import React from 'react';
import styles from '../../estilos/componentes/comuns/Depoimentos.module.css';
import { getTexto, getTemaConteudosByCategoria } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const SECTION_ID = 'depoimentos';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém o depoimento principal a ser exibido
 * @returns {Object|null} Primeiro depoimento ou null se não existir
 */
const getDepoimentoPrincipal = () => {
  const depoimentos = getTemaConteudosByCategoria('clientes');
  if (!depoimentos?.length) return null;
  const primeiro = depoimentos[0];
  return primeiro.dados || primeiro;
};

/**
 * Formata a assinatura do autor do depoimento
 * @param {string} name - Nome do autor
 * @param {string} location - Localização do autor
 * @returns {string} Assinatura formatada
 */
const formatAuthorSignature = (name, location) => {
  return `- ${name}, ${location}`;
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * DepoimentosHeader - Título da seção de depoimentos
 * @returns {React.ReactElement}
 */
const DepoimentosHeader = () => (
  <h2 className={`text-center ${styles['texto-oni-azul']} mb-5`} role="heading" aria-level="2">
    {getTexto('depoimentos', 'titulo', 'Depoimentos')}
  </h2>
);

/**
 * DepoimentoCard - Card individual de depoimento
 * @param {Object} props - Props do componente
 * @param {Object} props.depoimento - Dados do depoimento
 * @returns {React.ReactElement}
 */
const DepoimentoCard = ({ depoimento }) => (
  <div
    className={styles['depoimento']}
    role="article"
    aria-label={`Depoimento de ${depoimento.name}`}
  >
    {/* Citação */}
    <blockquote>
      <p className={styles['destaque']}>"{depoimento.text}"</p>
    </blockquote>

    {/* Assinatura do autor */}
    <footer className={styles['autor']}>
      {formatAuthorSignature(depoimento.name, depoimento.location)}
    </footer>
  </div>
);

/**
 * EmptyState - Estado vazio quando não há depoimentos
 * @returns {React.ReactElement}
 */
const EmptyState = () => (
  <div className="text-center text-muted">
    <p>{getTexto('depoimentos', 'vazio', 'Nenhum depoimento disponível no momento.')}</p>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente Depoimentos - Seção de depoimentos de clientes
 * @returns {React.ReactElement}
 */
const Depoimentos = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const depoimento = getDepoimentoPrincipal();

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <section
      id={SECTION_ID}
      className={`${styles['secao']} py-5 ${styles['fundo-claro']}`}
      role="region"
      aria-labelledby="depoimentos-title"
    >
      <div className="container">
        {/* Título da seção */}
        <DepoimentosHeader />

        {/* Conteúdo do depoimento */}
        <div className="row">
          <div className="col-md-8 mx-auto">
            {depoimento ? <DepoimentoCard depoimento={depoimento} /> : <EmptyState />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Depoimentos;
