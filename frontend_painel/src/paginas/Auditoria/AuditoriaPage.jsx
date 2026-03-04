/**
 * @file Página de Auditoria - Rastreamento de Ações
 * @description Visualização de logs de auditoria do sistema
 * Apenas para usuários com permissão 'auditoria_visualizar'
 */

import { useState, useEffect, useCallback } from 'react';
import { FaHistory, FaFilter } from 'react-icons/fa';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiLogIn,
  FiLogOut,
  FiLock,
  FiInfo,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import AuditoriaService from '../../servicos/auditoria';
import Grid from '../../componentes/Comum/Grid';
import '../../estilos/paginas/AuditoriaPage.css';

// ============================================================================
// MAPA DE ÍCONES
// ============================================================================

const ICONEMAP = {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiLogIn,
  FiLogOut,
  FiLock,
  FiInfo,
  FiCheckCircle,
  FiXCircle,
};

const renderIcone = (nomeDaFuncao, tamanho = 16) => {
  const Icone = ICONEMAP[nomeDaFuncao];
  return Icone ? <Icone size={tamanho} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> : null;
};

// ============================================================================
// CONSTANTES
// ============================================================================

const PAGINACAO = {
  PAGINA_INICIAL: 1,
  ITENS_POR_PAGINA: 10,
};

const DURACAO_ALERTA = 3000;

// Renderizador de Ação com Ícone
// Renderizador de Status com Ícone e Classe
const renderStatus = (valor) => {
  if (!valor || typeof valor !== 'object') return valor;
  const { texto, icone, classe } = valor;
  return (
    <span className={`auditoria-status ${classe || ''}`}>
      {renderIcone(icone, 14)}
      {texto}
    </span>
  );
};

const COLUNAS_GRID = [
  { chave: 'entidade', titulo: 'Entidade', largura: '15%' },
  { chave: 'usuario', titulo: 'Usuário', largura: '20%' },
  {
    chave: 'status',
    titulo: 'Status',
    largura: '12%',
    render: renderStatus,
  },
  { chave: 'ip', titulo: 'IP', largura: '15%' },
  { chave: 'data', titulo: 'Data/Hora', largura: '20%' },
  {
    chave: 'detalhes',
    titulo: 'Detalhes',
    largura: '18%',
    render: (valor) => valor.substring(0, 30) + (valor.length > 30 ? '...' : ''),
  },
];

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

const criarAlerta = (tipo, mensagem) => ({ tipo, mensagem });

// ============================================================================
// COMPONENTE
// ============================================================================

function AuditoriaPage() {
  const { _usuario, temPermissao } = useAuth();
  const podeVisualizar = temPermissao('auditoria_visualizar');

  // Estado
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [alerta, setAlerta] = useState(null);
  
  // Filtros
  const [_filtro, _setFiltro] = useState('');
  const [filtros, setFiltros] = useState({
    acao: '',
    entidade: '',
    dataInicio: '',
    dataFim: '',
  });

  // Carregar logs de auditoria
  const carregarLogs = useCallback(async () => {
    try {
      setLoading(true);
      const resposta = await AuditoriaService.listar({
        page: pagina,
        limit: PAGINACAO.ITENS_POR_PAGINA,
        ...filtros,
      });

      const logsFormatados = (resposta.data || []).map((log) => ({
        aud_id: log.aud_id,
        acao: AuditoriaService.formatarAcao(log.aud_acao),
        entidade: log.aud_entidade || '-',
        usuario: log.usuario?.usu_email || 'Desconhecido',
        status: AuditoriaService.formatarStatus(log.aud_status),
        ip: log.aud_ip || '-',
        data: new Date(log.createdAt).toLocaleString('pt-BR'),
        detalhes: log.aud_mensagem_erro || 'OK',
      }));

      setLogs(logsFormatados);
      
      if (resposta.pagination) {
        setTotalPaginas(resposta.pagination.pages || 1);
        setTotalLogs(resposta.pagination.total || 0);
      }
    } catch (erro) {
      console.error('Erro ao carregar logs:', erro);
      setAlerta(criarAlerta('erro', 'Erro ao carregar logs de auditoria'));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [pagina, filtros]);

  // Carregar estatísticas de auditoria
  const carregarEstatisticas = useCallback(async () => {
    try {
      const resposta = await AuditoriaService.estatisticas(filtros);
      setStats(resposta.data || null);
    } catch (erro) {
      console.error('Erro ao carregar estatísticas:', erro);
    }
  }, [filtros]);

  // Carregar dados
  useEffect(() => {
    if (podeVisualizar) {
      carregarLogs();
      carregarEstatisticas();
    }
  }, [pagina, filtros, podeVisualizar, carregarLogs, carregarEstatisticas]);

  // Verificar permissão
  if (!podeVisualizar) {
    return (
      <div className="auditoria-page">
        <div className="auditoria-header">
          <div className="auditoria-header-content">
            <div>
              <h1><FaHistory /> Auditoria</h1>
              <p>Rastreamento de ações do sistema</p>
            </div>
          </div>
        </div>

        <div className="auditoria-restricao">
          <FaFilter className="icone" />
          <h2>Acesso Restrito</h2>
          <p>Você não tem permissão para visualizar registros de auditoria.</p>
          <p className="detalhes">
            Permissão necessária: <code>auditoria_visualizar</code>
          </p>
        </div>
      </div>
    );
  }

  const handleFiltroMudar = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    setPagina(1);
  };

  const handleLimparFiltros = () => {
    setFiltros({
      acao: '',
      entidade: '',
      dataInicio: '',
      dataFim: '',
    });
    setPagina(1);
  };

  return (
    <div className="auditoria-page">
      {/* Header */}
      <div className="auditoria-header">
        <div className="auditoria-header-content">
          <div>
            <h1><FaHistory /> Auditoria</h1>
            <p>Rastreamento de ações do sistema</p>
          </div>
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`auditoria-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Estatísticas */}
      {stats && (
        <div className="auditoria-estatisticas">
          <div className="auditoria-card-stat">
            <h3>Total de Ações</h3>
            <p className="valor">{stats.totalAcoes || 0}</p>
          </div>
          <div className="auditoria-card-stat erro">
            <h3>Total de Erros</h3>
            <p className="valor">{stats.totalErros || 0}</p>
          </div>
          <div className="auditoria-card-stat">
            <h3>Taxa de Erro</h3>
            <p className="valor">{(stats.taxaErro || 0).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="auditoria-filtros">
        <h3>Filtros</h3>
        <div className="auditoria-filtros-grid">
          <div className="auditoria-filtro-grupo">
            <label>Ação</label>
            <select 
              value={filtros.acao}
              onChange={(e) => handleFiltroMudar('acao', e.target.value)}
              className="auditoria-filtro-select"
            >
              <option value="">Todas as ações</option>
              <option value="criar">Criar</option>
              <option value="editar">Editar</option>
              <option value="deletar">Deletar</option>
              <option value="visualizar">Visualizar</option>
              <option value="login">Login</option>
            </select>
          </div>

          <div className="auditoria-filtro-grupo">
            <label>Entidade</label>
            <select 
              value={filtros.entidade}
              onChange={(e) => handleFiltroMudar('entidade', e.target.value)}
              className="auditoria-filtro-select"
            >
              <option value="">Todas as entidades</option>
              <option value="parceiro">Parceiro</option>
              <option value="tema">Tema</option>
              <option value="pagina">Página</option>
              <option value="componente">Componente</option>
              <option value="elemento">Elemento</option>
              <option value="auth">Autenticação</option>
            </select>
          </div>

          <div className="auditoria-filtro-grupo">
            <label>Data Início</label>
            <input 
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => handleFiltroMudar('dataInicio', e.target.value)}
              className="auditoria-filtro-input"
            />
          </div>

          <div className="auditoria-filtro-grupo">
            <label>Data Fim</label>
            <input 
              type="date"
              value={filtros.dataFim}
              onChange={(e) => handleFiltroMudar('dataFim', e.target.value)}
              className="auditoria-filtro-input"
            />
          </div>
        </div>

        <div className="auditoria-filtros-acoes">
          <button 
            className="auditoria-btn-limpar"
            onClick={handleLimparFiltros}
            disabled={loading}
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Grid com Paginação */}
      <Grid
        dados={logs}
        colunas={COLUNAS_GRID}
        carregando={loading}
        mensagemVazia="Nenhum registro de auditoria encontrado"
        iconoVazio={<FaHistory />}
        totalItens={totalLogs}
        totalPaginas={totalPaginas}
        onCarregarDados={(pagina) => setPagina(pagina)}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
      />
    </div>
  );
}

export default AuditoriaPage;
