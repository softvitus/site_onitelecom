/**
 * @fileoverview Componente PlanoControle - Seção promocional de planos de controle
 * @component
 * @description
 * Renderiza uma seção promocional de planos de telefonia com:
 * - Banner principal com background 5G
 * - Título, subtítulo e benefícios
 * - Preço formatado em reais
 * - Botão CTA para contratação
 * - Seção informativa com imagem e descrição
 * @returns {React.ReactElement} Seção completa de plano controle
 */

import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../estilos/componentes/comuns/PlanoControle.module.css';
import { getTexto, getImagem, getLink } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const SECTION_ID = 'plano-controle';

/** @constant {string} Rota de destino para telefonia */
const ROUTE_TELEFONIA = getLink('rota', 'Planos', '/Planos');

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Formata o preço separando parte inteira e decimal
 * @param {string} preco - Preço no formato "XX,XX"
 * @returns {Object} {integer, decimal}
 */
const formatPrice = (preco) => {
  const parts = preco.split(',');
  return {
    integer: parts[0] || '0',
    decimal: parts[1] || '00',
  };
};

/**
 * Obtém os benefícios do plano do tema
 * @returns {Object} Objeto com benefícios formatados
 */
const getBeneficios = () => ({
  ligacoes: getTexto('planoControle', 'beneficio_ligacoes', 'Ligações'),
  ilimitadas: getTexto('planoControle', 'beneficio_ilimitadas', 'Ilimitadas'),
  mais: getTexto('planoControle', 'beneficio_mais', '+'),
  internet: getTexto('planoControle', 'beneficio_internet', 'Internet'),
  movel: getTexto('planoControle', 'beneficio_movel', 'Móvel'),
  apartir: getTexto('planoControle', 'beneficio_apartir', 'A partir de'),
});

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * BackgroundImage - Imagem de fundo 5G
 * @returns {React.ReactElement}
 */
const BackgroundImage = () => (
  <img
    src={getImagem('planoControle', 'background5g', '')}
    alt="5G"
    className={styles['main-image7']}
    loading="lazy"
    aria-hidden="true"
  />
);

/**
 * BeneficiosList - Lista de benefícios do plano
 * @returns {React.ReactElement}
 */
const BeneficiosList = () => {
  const beneficios = getBeneficios();

  return (
    <div className={styles['subtext7']} aria-label="Benefícios do plano">
      <h3>{beneficios.ligacoes}</h3>
      <h3>{beneficios.ilimitadas}</h3>
      <h3>
        <span className={styles['span27']}>{beneficios.mais}</span> {beneficios.internet}
      </h3>
      <h3>{beneficios.movel}</h3>
      <h3>{beneficios.apartir}</h3>
    </div>
  );
};

/**
 * PriceDisplay - Exibe o preço formatado
 * @returns {React.ReactElement}
 */
const PriceDisplay = () => {
  const { integer, decimal } = formatPrice(getTexto('planoControle', 'preco', '0,00'));

  return (
    <div className={styles['price-container7']} aria-label={`Preço: R$ ${integer},${decimal}`}>
      <div className={styles['price-symbol7']}>R$</div>
      <div className={styles['price-big7']}>{integer}</div>
      <div className={styles['price-small7']}>,{decimal}</div>
    </div>
  );
};

/**
 * CtaButton - Botão de chamada para ação
 * @returns {React.ReactElement}
 */
const CtaButton = () => (
  <button className={styles['cta-button7']} aria-label="Ver planos de telefonia">
    <Link to={ROUTE_TELEFONIA} className={styles['cta-link']}>
      {getTexto('planoControle', 'botao', 'Ver Planos')}
    </Link>
  </button>
);

/**
 * DeviceIcons - Ícones de smartphone e chip
 * @returns {React.ReactElement}
 */
const DeviceIcons = () => (
  <div className="col-md-6 d-flex justify-content-end">
    <div className={styles['icons7']} aria-hidden="true">
      <div className={styles['icon-smartphone7']}>
        <img
          src={getImagem('planoControle', 'smartphone', '')}
          alt="Smartphone"
          className="img-fluid"
          loading="lazy"
        />
        <div className={styles['icon-sim7']}>
          <img
            src={getImagem('planoControle', 'chip', '')}
            alt="Chip"
            className="img-fluid"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </div>
);

/**
 * HeroSection - Seção principal do banner
 * @returns {React.ReactElement}
 */
const HeroSection = () => (
  <div className={styles['container7']} role="banner">
    {/* Background */}
    <BackgroundImage />

    <div className="container-fluid">
      <div className={`row ${styles['right-section7']}`}>
        <div className={`col-md-6 ${styles['left-section7']}`}>
          {/* Títulos */}
          <h1>{getTexto('planoControle', 'titulo', 'Plano Controle')}</h1>
          <h2>{getTexto('planoControle', 'subtitulo', '')}</h2>

          {/* Benefícios */}
          <BeneficiosList />

          {/* Preço */}
          <PriceDisplay />

          {/* CTA */}
          <CtaButton />

          {/* Ícones de dispositivos */}
          <DeviceIcons />
        </div>
      </div>
    </div>
  </div>
);

/**
 * InfoSection - Seção informativa com imagem e texto
 * @returns {React.ReactElement}
 */
const InfoSection = () => (
  <div
    className={styles['info-section7']}
    role="complementary"
    aria-labelledby="info-section-title"
  >
    <div className="container">
      <div className="row align-items-center">
        {/* Imagem */}
        <div className="col-md-6">
          <img
            src={getImagem('planoControle', 'figurafeminina', '')}
            alt="Pessoa usando o celular"
            className={`${styles['person-image7']} img-fluid`}
            loading="lazy"
          />
        </div>

        {/* Texto informativo */}
        <div className={`col-md-6 ${styles['info-text7']}`}>
          <h2 id="info-section-title">
            {getTexto('planoControle.secaoInfo', 'titulo', 'Controle total na palma da mão')}
          </h2>
          <p className={styles['main-paragraph7']}>
            {getTexto(
              'planoControle.secaoInfo',
              'descricao',
              'Com o Plano Controle, você tem ligações ilimitadas para qualquer operadora do Brasil, internet de alta velocidade e o melhor: sem surpresas na sua fatura.'
            )}
          </p>
          <p className={styles['footnote7']}>
            {getTexto(
              'planoControle.secaoInfo',
              'rodape',
              '*Consulte disponibilidade em sua região.'
            )}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente PlanoControle - Seção de planos de controle
 * @returns {React.ReactElement}
 */
const PlanoControle = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <section id={SECTION_ID} aria-label="Plano Controle">
      {/* Seção Hero com banner principal */}
      <HeroSection />

      {/* Seção informativa */}
      <InfoSection />
    </section>
  );
};

export default PlanoControle;


