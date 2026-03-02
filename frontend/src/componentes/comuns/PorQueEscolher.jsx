/**
 * @fileoverview Componente PorQueEscolher - Seção de diferenciais da empresa
 * @component
 * @description
 * Renderiza uma seção com os motivos para escolher a empresa:
 * - Título da seção
 * - Grid de recursos/diferenciais com ícones
 * - Título e descrição de cada diferencial
 * @returns {React.ReactElement} Seção de diferenciais
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faCogs, faHeadset } from '@fortawesome/free-solid-svg-icons';
import styles from '../../estilos/componentes/comuns/PorQueEscolher.module.css';
import { getTexto, getTemaConteudosByTipo } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const SECTION_ID = 'sobre';

/** @constant {string} Título padrão da seção */
const DEFAULT_SECTION_TITLE = 'Por Que Escolher?';

/**
 * Mapeamento de nomes de ícones para componentes FontAwesome
 * @constant {Object}
 */
const ICON_MAP = {
  faUserTie,
  faCogs,
  faHeadset,
};

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém o ícone FontAwesome correspondente ao nome
 * @param {string} iconName - Nome do ícone
 * @returns {Object} Componente de ícone FontAwesome
 */
const getIconByName = (iconName) => {
  return ICON_MAP[iconName] || faUserTie;
};

/**
 * Mapeia os recursos do tema adicionando os ícones resolvidos
 * @returns {Array<Object>} Array de recursos com ícones resolvidos
 */
const getRecursosWithIcons = () => {
  const conteudos = getTemaConteudosByTipo('porQueEscolher');
  return conteudos.map((recurso) => {
    // Parseia o JSON do valor se existir
    const dados = recurso.valor ? JSON.parse(recurso.valor) : {};
    return {
      id: recurso.id,
      icon: getIconByName(dados.icon || recurso.tipo),
      titulo: dados.titulo || recurso.tipo,
      descricao: dados.descricao || '',
    };
  });
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * SectionHeader - Título da seção
 * @returns {React.ReactElement}
 */
const SectionHeader = () => (
  <h2 className={`text-center ${styles['texto-oni-azul']} mb-5`} role="heading" aria-level="2">
    {getTexto('porQueEscolher', 'titulo', DEFAULT_SECTION_TITLE)}
  </h2>
);

/**
 * RecursoIcon - Ícone do recurso/diferencial
 * @param {Object} props - Props do componente
 * @param {Object} props.icon - Ícone FontAwesome
 * @returns {React.ReactElement}
 */
const RecursoIcon = ({ icon }) => (
  <div className={styles['icone-recurso']}>
    <FontAwesomeIcon icon={icon} aria-hidden="true" />
  </div>
);

/**
 * RecursoCard - Card individual de recurso/diferencial
 * @param {Object} props - Props do componente
 * @param {Object} props.recurso - Dados do recurso
 * @param {number} props.index - Índice do recurso
 * @returns {React.ReactElement}
 */
const RecursoCard = ({ recurso, index }) => (
  <div className="col-md-4 mb-4">
    <div
      className={styles['item-recurso']}
      role="article"
      aria-labelledby={`recurso-titulo-${index}`}
    >
      {/* Ícone */}
      <RecursoIcon icon={recurso.icon} />

      {/* Título */}
      <h4 id={`recurso-titulo-${index}`} className={styles['titulo-recurso']}>
        {recurso.titulo}
      </h4>

      {/* Descrição */}
      <p>{recurso.descricao}</p>
    </div>
  </div>
);

/**
 * RecursosGrid - Grid de recursos/diferenciais
 * @param {Object} props - Props do componente
 * @param {Array<Object>} props.recursos - Lista de recursos
 * @returns {React.ReactElement}
 */
const RecursosGrid = ({ recursos }) => (
  <div className="row" role="region" aria-label="Lista de diferenciais">
    {recursos.map((recurso, index) => (
      <RecursoCard key={recurso.id || index} recurso={recurso} index={index} />
    ))}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente PorQueEscolher - Seção de diferenciais da empresa
 * @returns {React.ReactElement}
 */
const PorQueEscolher = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const recursos = getRecursosWithIcons();

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <section
      id={SECTION_ID}
      className={styles['secao']}
      role="region"
      aria-labelledby="por-que-escolher-title"
    >
      <div className="container">
        {/* Título da seção */}
        <SectionHeader />

        {/* Grid de recursos/diferenciais */}
        <RecursosGrid recursos={recursos} />
      </div>
    </section>
  );
};

export default PorQueEscolher;
