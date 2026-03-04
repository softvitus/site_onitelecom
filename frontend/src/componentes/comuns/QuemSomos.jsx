/**
 * @fileoverview Componente Quemsomos - Seção institucional "Quem Somos"
 * @component
 * @description
 * Renderiza uma seção institucional com:
 * - Título e subtítulo
 * - Descrição em parágrafos
 * - Botão de ação
 * - Imagem da equipe
 * - Boxes informativos (Oferecemos e Diferenciais)
 * @returns {React.ReactElement} Seção "Quem Somos" completa
 */

import React from 'react';
import styles from '../../estilos/componentes/comuns/QuemSomos.module.css';
import { getTexto, getImagem, getTemaTextosByCategoria } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const SECTION_ID = 'quem-somos';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém os textos da seção do tema
 * @returns {Object} Objeto com todos os textos
 */
const getTexts = () => {
  // Busca todos os textos da categoria quemSomos
  const textos = getTemaTextosByCategoria('quemSomos');
  const textMap = {};

  textos.forEach((t) => {
    textMap[t.chave] = t.valor;
  });

  // Monta objeto com estrutura esperada pelo componente
  return {
    titulo: textMap.titulo || 'MUITO PRAZER!',
    subtitulo: textMap.subtitulo || 'SOMOS A SUA EMPRESA.',
    paragrafo1: textMap.paragrafo1 || '',
    paragrafo2: textMap.paragrafo2 || '',
    botao: textMap.botao || 'Entre em Contato',
    oferecemos: {
      titulo: textMap.oferecemosTitulo || 'O que oferecemos?',
      items: textMap.oferecemosItems ? JSON.parse(textMap.oferecemosItems) : [],
    },
    diferenciais: {
      titulo: textMap.diferenciaisTitulo || 'Nossos diferenciais',
      items: textMap.diferenciaisItems ? JSON.parse(textMap.diferenciaisItems) : [],
    },
  };
};

/**
 * Obtém a imagem da seção do tema
 * @returns {string} URL da imagem
 */
const getImage = () => getImagem('about', 'img', '');

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * SectionHeader - Título e descrição da seção
 * @param {Object} props - Props do componente
 * @param {Object} props.texts - Textos da seção
 * @returns {React.ReactElement}
 */
const SectionHeader = ({ texts }) => (
  <div className={styles.textoContainer}>
    {/* Título */}
    <h1 className={styles.tituloPrincipal}>
      {texts.titulo} <br /> {texts.subtitulo}
    </h1>

    {/* Parágrafos */}
    <p className={styles.descricaoPrincipal}>{texts.paragrafo1}</p>
    <p className={styles.descricaoPrincipal}>{texts.paragrafo2}</p>

    {/* Botão de ação */}
    <button className={styles.botaoAcao} aria-label="Saiba mais sobre a empresa">
      {texts.botao}
    </button>
  </div>
);

/**
 * TeamImage - Imagem da equipe
 * @param {Object} props - Props do componente
 * @param {string} props.src - URL da imagem
 * @returns {React.ReactElement}
 */
const TeamImage = ({ src }) => (
  <div className={styles.wrapperImagem}>
    <img src={src} alt="Equipe da Oni Telecom com notebook" loading="lazy" />
  </div>
);

/**
 * InfoBox - Box informativo com título e lista
 * @param {Object} props - Props do componente
 * @param {string} props.title - Título do box
 * @param {Array<string>} props.items - Lista de itens
 * @param {string} props.id - ID único do box
 * @returns {React.ReactElement}
 */
const InfoBox = ({ title, items, id }) => (
  <div className={styles.infoBox} aria-labelledby={`info-box-${id}`}>
    <h3 id={`info-box-${id}`}>{title}</h3>
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

/**
 * InfoSection - Seção de informações adicionais
 * @param {Object} props - Props do componente
 * @param {Object} props.texts - Textos da seção
 * @returns {React.ReactElement}
 */
const InfoSection = ({ texts }) => (
  <div className={styles.secaoInfo} role="complementary" aria-label="Informações adicionais">
    <div className={styles.infoContainer}>
      {/* Box: O que oferecemos */}
      <InfoBox title={texts.oferecemos.titulo} items={texts.oferecemos.items} id="oferecemos" />

      {/* Box: Diferenciais */}
      <InfoBox
        title={texts.diferenciais.titulo}
        items={texts.diferenciais.items}
        id="diferenciais"
      />
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente Quemsomos - Seção institucional
 * @returns {React.ReactElement}
 */
const Quemsomos = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const texts = getTexts();
  const image = getImage();

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <section
      id={SECTION_ID}
      className={styles.secaoPrincipal}
     
      aria-labelledby="quem-somos-title"
    >
      <div className={styles.container}>
        {/* Conteúdo principal */}
        <div className={styles.conteudoPrincipal}>
          {/* Texto e botão */}
          <SectionHeader texts={texts} />

          {/* Imagem */}
          <TeamImage src={image} />
        </div>

        {/* Informações adicionais */}
        <InfoSection texts={texts} />
      </div>
    </section>
  );
};

export default Quemsomos;


