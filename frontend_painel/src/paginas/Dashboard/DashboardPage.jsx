/**
 * @file Página Dashboard
 * @description Página inicial após login com resumo de estatísticas
 * da plataforma (Parceiros, Temas, Páginas, Componentes) e seção
 * de atividades recentes.
 * 
 * @module paginas/Dashboard/DashboardPage
 */

import { useAuth } from '../../hooks/useAuth';
import { FaUsers, FaPalette, FaFile, FaTools, FaWaveSquare } from 'react-icons/fa';
import '../../estilos/paginas/DashboardPage.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const DASHBOARD_CARDS = [
  {
    id: 'parceiros',
    titulo: 'Parceiros',
    subtitulo: 'Cadastros ativos',
    valor: 0,
    icone: FaUsers,
    corFundo: '#e7f1ff',
    corIcone: '#0d6efd',
  },
  {
    id: 'temas',
    titulo: 'Temas',
    subtitulo: 'Temas disponíveis',
    valor: 0,
    icone: FaPalette,
    corFundo: '#f0e7ff',
    corIcone: '#6f42c1',
  },
  {
    id: 'paginas',
    titulo: 'Páginas',
    subtitulo: 'Páginas criadas',
    valor: 0,
    icone: FaFile,
    corFundo: '#e7fff0',
    corIcone: '#198754',
  },
  {
    id: 'componentes',
    titulo: 'Componentes',
    subtitulo: 'Componentes registrados',
    valor: 0,
    icone: FaTools,
    corFundo: '#fff0e7',
    corIcone: '#fd7e14',
  },
];

const MENSAGEM_SEM_ATIVIDADES = 'Nenhuma atividade registrada ainda';

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

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Bem-vindo ao Dashboard! <FaWaveSquare color="#0d6efd" size={24} />
        </h1>
        <p>Olá, {usuario?.usr_nome || 'Usuário'}! Aqui você gerencia toda a plataforma.</p>
      </div>

      <div className="dashboard-grid">
        {DASHBOARD_CARDS.map((card) => {
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
              <div className="card-value">{card.valor}</div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-section">
        <h2>Últimas Atividades</h2>
        <div className="activity-list">
          <p style={{ color: '#6c757d', textAlign: 'center', padding: '2rem' }}>
            {MENSAGEM_SEM_ATIVIDADES}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
