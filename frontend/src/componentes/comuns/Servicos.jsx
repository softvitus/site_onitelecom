/**
 * @fileoverview Componente Servicos - Exibe grid de serviços oferecidos
 * @component
 * @description
 * Renderiza uma seção com cards de serviços contendo:
 * - Ícone representativo do serviço
 * - Título e descrição
 * - Lista de recursos/funcionalidades
 * - Botão de ação
 * @returns {React.ReactElement} Seção de serviços completa
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faPhoneAlt, faMobileAlt, faTv, faVideo } from '@fortawesome/free-solid-svg-icons';
import styles from '../../estilos/componentes/comuns/Servicos.module.css';
import { getTexto, getTemaConteudosByTipo } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const SECTION_ID = 'servicos';

/**
 * Mapeamento de nomes de ícones para componentes FontAwesome
 * @constant {Object}
 */
const ICON_MAP = {
  faGlobe,
  faPhoneAlt,
  faMobileAlt,
  faTv,
  faVideo,
};

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém o ícone FontAwesome correspondente ao nome
 * @param {string} iconName - Nome do ícone (ex: 'faGlobe')
 * @returns {Object} Componente de ícone FontAwesome
 */
const getIconByName = (iconName) => {
  return ICON_MAP[iconName] || faGlobe;
};

/**
 * Mapeia os serviços do tema adicionando os ícones resolvidos
 * @returns {Array<Object>} Array de serviços com ícones resolvidos
 */
const getServicosWithIcons = () => {
  const conteudos = getTemaConteudosByTipo('servicos');
  return conteudos.map((servico) => {
    // Parseia o JSON do valor se existir
    const dados = servico.valor ? JSON.parse(servico.valor) : {};
    return {
      id: servico.id,
      icon: getIconByName(dados.icon || servico.tipo),
      titulo: dados.titulo || servico.tipo,
      descricao: dados.descricao || '',
      recursos: dados.recursos || [],
    };
  });
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * ServicosHeader - Título da seção de serviços
 * @returns {React.ReactElement}
 */
const ServicosHeader = () => (
  <h2 className={`text-center ${styles['texto-oni-azul']} mb-5`}>
    {getTexto('servicos', 'title', 'Nossos Serviços')}
  </h2>
);

/**
 * ServicoIcon - Ícone do serviço com wrapper
 * @param {Object} props - Props do componente
 * @param {Object} props.icon - Ícone FontAwesome
 * @returns {React.ReactElement}
 */
const ServicoIcon = ({ icon }) => (
  <div className={styles['icone-wrapper']}>
    <FontAwesomeIcon icon={icon} className={styles['icone-cartao']} aria-hidden="true" />
  </div>
);

/**
 * ServicoRecursos - Lista de recursos do serviço
 * @param {Object} props - Props do componente
 * @param {Array<string>} props.recursos - Lista de recursos
 * @returns {React.ReactElement}
 */
const ServicoRecursos = ({ recursos }) => (
  <ul className="list-unstyled">
    {recursos.map((recurso, idx) => (
      <li key={idx}>
        {recurso}
      </li>
    ))}
  </ul>
);

/**
 * ServicoCard - Card individual de serviço
 * @param {Object} props - Props do componente
 * @param {Object} props.servico - Dados do serviço
 * @param {number} props.index - Índice do serviço
 * @returns {React.ReactElement}
 */
const ServicoCard = ({ servico, index }) => (
  <div className={styles['cartao']} role="article" aria-labelledby={`servico-titulo-${index}`}>
    <div className={`${styles['corpo-cartao']} text-center`}>
      {/* Ícone */}
      <ServicoIcon icon={servico.icon} />

      {/* Título */}
      <h3 id={`servico-titulo-${index}`} className={styles['titulo-cartao']}>
        {servico.titulo}
      </h3>

      {/* Descrição */}
      <p className={styles['texto-cartao']}>{servico.descricao}</p>

      {/* Lista de recursos */}
      <ServicoRecursos recursos={servico.recursos} />

      {/* Botão de ação */}
      <a
        href="#"
        className={`btn ${styles['botao-oni']} mt-3`}
        aria-label={`Saiba mais sobre ${servico.titulo}`}
      >
        {getTexto('servicos', 'buttonText', 'Saiba Mais')}
      </a>
    </div>
  </div>
);

/**
 * ServicosGrid - Grid de cards de serviços
 * @param {Object} props - Props do componente
 * @param {Array<Object>} props.servicos - Lista de serviços
 * @returns {React.ReactElement}
 */
const ServicosGrid = ({ servicos }) => (
  <div className={styles['grade-servicos']} aria-label="Lista de serviços">
    {servicos.map((servico, index) => (
      <ServicoCard key={servico.id || index} servico={servico} index={index} />
    ))}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente Servicos - Seção de serviços oferecidos
 * @returns {React.ReactElement}
 */
const Servicos = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const servicos = getServicosWithIcons();

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <section
      id={SECTION_ID}
      className={`${styles['secao']} py-5 ${styles['fundo-claro']}`}
     
      aria-labelledby="servicos-title"
    >
      <div className="container">
        {/* Título da seção */}
        <ServicosHeader />

        {/* Grid de serviços */}
        <ServicosGrid servicos={servicos} />
      </div>
    </section>
  );
};

export default Servicos;

