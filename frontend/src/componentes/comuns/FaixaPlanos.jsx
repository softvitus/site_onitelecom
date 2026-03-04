/**
 * @fileoverview Componente FaixaPlanos - Banner CTA para planos personalizados
 * @component
 * @description
 * Renderiza uma faixa promocional com:
 * - Efeito visual de partículas/bolhas animadas
 * - Texto de chamada destacado
 * - Botão de ação para configurar plano
 * @returns {React.ReactElement} Faixa promocional de planos
 */

import React, { useCallback } from 'react';
import styles from '../../estilos/componentes/comuns/FaixaPlanos.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { getTexto, getLink } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {number} Número de partículas decorativas */
const PARTICLE_COUNT = 5;

/** @constant {string} Rota de destino ao clicar no CTA */
const ROUTE_MONTE_SEU_PLANO = getLink('rota', 'Monte Seu Plano', '/monte-seu-plano');

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Navega para uma rota específica
 * @param {string} route - Rota de destino
 */
const navigateToRoute = (route) => {
  window.location.href = route;
};

/**
 * Gera um array de índices para as partículas
 * @param {number} count - Número de partículas
 * @returns {Array<number>} Array de índices
 */
const generateParticleIndices = (count) => {
  return Array.from({ length: count }, (_, i) => i);
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * ParticlesBackground - Fundo decorativo com partículas animadas
 * @returns {React.ReactElement}
 */
const ParticlesBackground = () => (
  <div className={styles['particulas']} aria-hidden="true">
    {generateParticleIndices(PARTICLE_COUNT).map((index) => (
      <div key={index} className={styles['bolinha']} />
    ))}
  </div>
);

/**
 * FaixaTexto - Texto promocional da faixa
 * @returns {React.ReactElement}
 */
const FaixaTexto = () => (
  <p className={styles['texto']}>
    <span className={styles['destaque']}>{getTexto('faixaPlanos', 'texto', '')}</span>
    {getTexto('faixaPlanos', 'subtexto', '')}
  </p>
);

/**
 * FaixaBotao - Botão de ação da faixa
 * @param {Object} props - Props do componente
 * @param {Function} props.onClick - Callback ao clicar
 * @returns {React.ReactElement}
 */
const FaixaBotao = ({ onClick }) => (
  <button className={styles['botao']} onClick={onClick} aria-label="Configurar seu próprio plano">
    <FontAwesomeIcon icon={faSlidersH} aria-hidden="true" />
    {getTexto('faixaPlanos', 'botao', 'Monte seu Plano')}
  </button>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente FaixaPlanos - Faixa CTA para planos personalizados
 * @returns {React.ReactElement}
 */
const FaixaPlanos = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Manipula clique no botão de plano personalizado
   */
  const handleCtaClick = useCallback(() => {
    navigateToRoute(ROUTE_MONTE_SEU_PLANO);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <div className="container">
      <div className={styles['faixa']} aria-label="Monte seu próprio plano">
        {/* Partículas decorativas */}
        <ParticlesBackground />

        {/* Conteúdo da faixa */}
        <div className="container">
          <div className={styles['conteudo']}>
            {/* Texto promocional */}
            <FaixaTexto />

            {/* Botão CTA */}
            <FaixaBotao onClick={handleCtaClick} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaixaPlanos;

