/**
 * @file Página Dashboard
 * @description Página inicial após login com resumo de estatísticas
 * da plataforma (Parceiros, Temas, Páginas, Componentes) e seção
 * de atividades recentes.
 * 
 * @module paginas/Dashboard/DashboardPage
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaUsers, FaPalette, FaFile, FaTools, FaWaveSquare } from 'react-icons/fa';
import ParceirosService from '../../servicos/parceiros';
import TemasService from '../../servicos/temas';
import PaginasService from '../../servicos/paginas';
import ComponentesService from '../../servicos/componentes';
import '../../estilos/paginas/DashboardPage.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const DASHBOARD_CARDS_CONFIG = [
  {
    id: 'parceiros',
    titulo: 'Parceiros',
    subtitulo: 'Cadastros ativos',
    icone: FaUsers,
    corFundo: '#e7f1ff',
    corIcone: '#0d6efd',
    servico: ParceirosService,
  },
  {
    id: 'temas',
    titulo: 'Temas',
    subtitulo: 'Temas disponíveis',
    icone: FaPalette,
    corFundo: '#f0e7ff',
    corIcone: '#6f42c1',
    servico: TemasService,
  },
  {
    id: 'paginas',
    titulo: 'Páginas',
    subtitulo: 'Páginas criadas',
    icone: FaFile,
    corFundo: '#e7fff0',
    corIcone: '#198754',
    servico: PaginasService,
  },
  {
    id: 'componentes',
    titulo: 'Componentes',
    subtitulo: 'Componentes registrados',
    icone: FaTools,
    corFundo: '#fff0e7',
    corIcone: '#fd7e14',
    servico: ComponentesService,
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página Dashboard
 * 
 * Página inicial exibida após login com resumo de estatísticas e
 * atividades recentes da plataforma. Fornece visão geral dos principais
 * módulos (Parceiros, Temas, Páginas, Componentes).
 * 
 * @component
 * @returns {JSX.Element}
 * 
 * @example
 * <DashboardPage />
 */
const DashboardPage = () => {
  const { usuario } = useAuth();
  const [cards, setCards] = useState(DASHBOARD_CARDS_CONFIG.map(c => ({ ...c, valor: 0, carregando: true })));

  // Carregar estatísticas ao montar
  useEffect(() => {
    const carregarEstatisticas = async () => {
      const novasCards = [];

      for (const card of DASHBOARD_CARDS_CONFIG) {
        try {
          const resultado = await card.servico.listar(1, 1000);
          const total = resultado.paginacao?.total || resultado.dados?.length || 0;
          novasCards.push({
            ...card,
            valor: total,
            carregando: false,
          });
        } catch (erro) {
          console.error(`Erro ao carregar ${card.id}:`, erro);
          novasCards.push({
            ...card,
            valor: 0,
            carregando: false,
          });
        }
      }

      setCards(novasCards);
    };

    carregarEstatisticas();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Bem-vindo ao Dashboard! <FaWaveSquare color="#0d6efd" size={24} />
        </h1>
        <p>Olá, {usuario?.usu_nome || 'Usuário'}! Aqui você gerencia toda a plataforma.</p>
      </div>

      <div className="dashboard-grid">
        {cards.map((card) => {
          const IconeCard = card.icone;
          return (
            <div key={card.id} className="dashboard-card">
              <div className="card-icon" style={{ backgroundColor: card.corFundo }}>
                <IconeCard size={24} color={card.corIcone} />
              </div>
              <div className="card-content">
                <h3>{card.titulo}</h3>
                <small>{card.subtitulo}</small>
              </div>
              <div className="card-value">
                {card.carregando ? '...' : card.valor}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardPage;
