/**
 * @fileoverview Componente ServicosEssenciaisInternet - Grid de serviços essenciais de internet
 * @component
 * @description
 * Renderiza uma seção de serviços essenciais de internet com:
 * - Grid responsivo de cards
 * - Imagens ilustrativas
 * - Título e descrição por serviço
 * - Layout dinâmico baseado em config
 * @returns {React.ReactElement} Seção de serviços essenciais de internet
 */

import React from 'react';
import styles from '../../estilos/componentes/comuns/ServicosEssenciaisInternet.module.css';
import { getTemaConteudosByCategoria, getTemaImagensByCategoria } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const SECTION_ID = 'servicos-essenciais-internet';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém os itens de serviços do tema
 * @returns {Object[]} Array de serviços
 */
const getServicesItems = () => {
  const conteudos = getTemaConteudosByCategoria('servicosEssenciaisInternet');
  return conteudos.map((item) => {
    const itemData = item.valor || item.dados;
    let dados = itemData;
    if (typeof itemData === 'string') {
      try {
        dados = JSON.parse(itemData);
      } catch (e) {
        dados = {};
      }
    } else {
      dados = itemData || {};
    }
    return {
      id: item.id,
      imgKey: dados.imgKey || item.tipo,
      alt: dados.alt || '',
      titulo: dados.titulo || '',
      descricao: dados.descricao || '',
    };
  });
};

/**
 * Obtém as imagens dos serviços do tema
 * @returns {Object} Mapa de imagens
 */
const getServicesImages = () => {
  const imagens = getTemaImagensByCategoria('servicosEssenciaisInternet');
  const imageMap = {};
  imagens.forEach((img) => {
    imageMap[img.nome] = img.valor;
  });
  return imageMap;
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * ServiceIcon - Imagem ilustrativa do serviço
 * @param {Object} props - Props do componente
 * @param {string} props.src - URL da imagem
 * @param {string} props.alt - Texto alternativo
 * @returns {React.ReactElement}
 */
const ServiceIcon = ({ src, alt }) => (
  <img src={src} alt={alt} className={styles['img-fluid']} loading="lazy" />
);

/**
 * ServiceCard - Card individual de serviço
 * @param {Object} props - Props do componente
 * @param {Object} props.item - Dados do serviço
 * @param {Object} props.images - Mapa de imagens
 * @returns {React.ReactElement}
 */
const ServiceCard = ({ item, images }) => (
  <div className={styles['col']}>
    <div className={styles['item16']} role="article">
      {/* Ícone */}
      <ServiceIcon src={images[item.imgKey]} alt={item.alt} />

      {/* Título */}
      <h3>{item.titulo}</h3>

      {/* Descrição */}
      <p>{item.descricao}</p>
    </div>
  </div>
);

/**
 * ServicesGrid - Grid de cards de serviços
 * @param {Object} props - Props do componente
 * @param {Object[]} props.items - Array de serviços
 * @param {Object} props.images - Mapa de imagens
 * @returns {React.ReactElement}
 */
const ServicesGrid = ({ items, images }) => (
  <div className={styles['row']} aria-label="Lista de serviços essenciais de internet">
    {items.map((item, index) => (
      <ServiceCard key={index} item={item} images={images} />
    ))}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente ServicosEssenciaisInternet - Seção de serviços essenciais de internet
 * @returns {React.ReactElement}
 */
const ServicosEssenciaisInternet = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const items = getServicesItems();
  const images = getServicesImages();

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <section
      id={SECTION_ID}
      className={styles['container16']}
     
      aria-labelledby="servicos-internet-title"
    >
      <div className={styles['container']}>
        {/* Grid de Serviços */}
        <ServicesGrid items={items} images={images} />
      </div>
    </section>
  );
};

export default ServicosEssenciaisInternet;


