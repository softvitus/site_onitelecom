/**
 * @file Página de Gerenciamento de Features
 * @description Interface completa de CRUD para features
 * 
 * @module paginas/Features/FeaturesPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaStar, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import FeaturesService from '../../servicos/features';
import TemasService from '../../servicos/temas';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/FeaturesPage.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const PAGINACAO = {
  PAGINA_INICIAL: 1,
  ITENS_POR_PAGINA: 10,
};

const DURACAO_ALERTA = 3000;

const FORM_INICIAL = {
  temaId: '',
  nome: '',
  habilitado: true,
};

const COLUNAS_GRID = [
  { chave: 'nome', titulo: 'Nome', largura: '50%' },
  { chave: 'temaId', titulo: 'Tema', largura: '25%' },
  {
    chave: 'habilitado',
    titulo: 'Status',
    largura: '25%',
    render: (valor) => (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '600',
        backgroundColor: valor ? '#dcfce7' : '#fee2e2',
        color: valor ? '#166534' : '#991b1b',
      }}>
        {valor ? 'Habilitado' : 'Desabilitado'}
      </span>
    ),
  },
];

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Cria um objeto de alerta formatado
 * @param {string} tipo - 'sucesso', 'erro', 'info', 'aviso'
 * @param {string} mensagem - Mensagem a exibir
 * @returns {Object}
 */
const criarAlerta = (tipo, mensagem) => ({ tipo, mensagem });

/**
 * Valida campos obrigatórios do formulário
 * @param {Object} dados - Dados do formulário
 * @returns {Object} Dicionário de erros
 */
const validarFormulario = (dados) => {
  const erros = {};

  if (!dados.temaId?.trim()) {
    erros.temaId = 'Tema é obrigatório';
  }

  if (!dados.nome?.trim()) {
    erros.nome = 'Nome é obrigatório';
  }

  return erros;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página de Gerenciamento de Features
 * 
 * Funcionalidades completas de CRUD.
 * 
 * @component
 * @returns {JSX.Element}
 */
const FeaturesPage = () => {
  // Autenticação e Permissões
  const { temPermissao } = useAuth();
  
  // Estado
  const [features, setFeatures] = useState([]);
  const [temas, setTemas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoTemas, setCarregandoTemas] = useState(false);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Paginação (gerenciada pelo Grid)
  const [totalFeatures, setTotalFeatures] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    feature: null,
    carregando: false,
  });

  // Carregar features ao montar o componente
  useEffect(() => {
    carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
    carregarTemas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recarregar quando filtro muda
  useEffect(() => {
    const timer = setTimeout(() => {
      carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  // Carregar dados para o Grid
  const carregarDadosGrid = async (pagina, itensPorPagina) => {
    setCarregando(true);
    setErro(null);

    try {
      const resultado = await FeaturesService.listar(pagina, itensPorPagina, {
        search: filtro,
      });

      if (resultado.sucesso) {
        setFeatures(resultado.dados);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalFeatures(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        setErro(resultado.erro || 'Erro ao carregar features');
      }
    } catch (err) {
      setErro('Erro inesperado ao carregar features');
      console.error('[ERRO]', err);
    } finally {
      setCarregando(false);
    }
  };

  // Carregar temas para o dropdown
  const carregarTemas = async () => {
    setCarregandoTemas(true);
    try {
      const resultado = await TemasService.listar(1, 100);
      if (resultado.sucesso) {
        setTemas(resultado.dados);
      }
    } catch (err) {
      console.error('[ERRO] ao carregar temas', err);
    } finally {
      setCarregandoTemas(false);
    }
  };

  // =========================================================================
  // FORMULÁRIO
  // =========================================================================

  const abrirModalCriar = () => {
    setEditando(null);
    setFormData(FORM_INICIAL);
    setErrosForm({});
    setModalAberto(true);
  };

  const abrirModalEditar = (feature) => {
    setEditando(feature.id);
    setFormData({
      temaId: feature.temaId || '',
      nome: feature.nome || '',
      habilitado: feature.habilitado !== false,
    });
    setErrosForm({});
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditando(null);
    setFormData(FORM_INICIAL);
    setErrosForm({});
  };

  // =========================================================================
  // SALVAR
  // =========================================================================

  const salvarFeature = async () => {
    const erros = validarFormulario(formData);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);

    try {
      const resultado = editando
        ? await FeaturesService.atualizar(editando, formData)
        : await FeaturesService.criar(formData);

      if (resultado.sucesso) {
        const msg = editando ? 'Feature atualizada com sucesso!' : 'Feature criada com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar feature'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao salvar feature'));
      console.error('[ERRO]', err);
    } finally {
      setSalvando(false);
    }
  };

  // =========================================================================
  // AÇÕES
  // =========================================================================

  const abrirConfirmarDelecao = (feature) => {
    setConfirmarDialog({
      aberto: true,
      feature,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      feature: null,
      carregando: false,
    });
  };

  const executarDelecao = async () => {
    if (!confirmarDialog.feature) return;

    setConfirmarDialog(prev => ({ ...prev, carregando: true }));

    const feature = confirmarDialog.feature;

    try {
      const resultado = await FeaturesService.deletar(feature.id);

      if (resultado.sucesso) {
        setAlerta(criarAlerta('sucesso', 'Feature deletada com sucesso!'));
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao deletar feature'));
        setConfirmarDialog(prev => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao deletar feature'));
      console.error('[ERRO]', err);
      setConfirmarDialog(prev => ({ ...prev, carregando: false }));
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="features-page">
      {/* Header */}
      <div className="features-header">
        <div className="features-header-content">
          <div>
            <h1>
              <FaStar /> Features
            </h1>
            <p>Gerenciar features do sistema</p>
          </div>
          {temPermissao('features_criar') && (
            <button className="features-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Nova Feature
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`features-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <div>
        <input
          type="text"
          placeholder="Buscar feature..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="features-filtro-input"
        />
      </div>

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={features}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhuma feature encontrada"
        iconoVazio={<FaStar />}
        totalItens={totalFeatures}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(feature) => (
          <div className="grid-actions-group">
            {temPermissao('features_editar') && (
              <button
                onClick={() => abrirModalEditar(feature)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('features_deletar') && (
              <button
                onClick={() => abrirConfirmarDelecao(feature)}
                className="grid-btn-action grid-btn-action-delete"
                title="Deletar"
              >
                <FaTrash />
              </button>
            )}
          </div>
        )}
      />

      {/* Modal */}
      <Modal
        aberto={modalAberto}
        onClose={fecharModal}
        titulo={editando ? 'Editar Feature' : 'Nova Feature'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button
              className="modal-btn-salvar"
              onClick={salvarFeature}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        }
      >
        <form className="modal-form">
          {/* Tema - obrigatório */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">Tema <span className="required">*</span></label>
              <select
                className="modal-form-select"
                value={formData.temaId}
                onChange={(e) => setFormData({ ...formData, temaId: e.target.value })}
                disabled={carregandoTemas}
              >
                <option value="">— Selecione um tema —</option>
                {temas.map((tema) => (
                  <option key={tema.id} value={tema.id}>
                    {tema.nome}
                  </option>
                ))}
              </select>
              {errosForm.temaId && (
                <span className="modal-form-error">{errosForm.temaId}</span>
              )}
            </div>
          </div>

          {/* Nome - obrigatório */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">Nome <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Chat Online, Agendamento, Consulta"
              />
              {errosForm.nome && (
                <span className="modal-form-error">{errosForm.nome}</span>
              )}
            </div>
          </div>

          {/* Habilitado */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group modal-form-checkbox-group">
              <label className="modal-form-label modal-form-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.habilitado}
                  onChange={(e) => setFormData({ ...formData, habilitado: e.target.checked })}
                />
                <span>Habilitado</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        aberto={confirmarDialog.aberto}
        titulo="Deletar Feature?"
        mensagem={`Tem certeza que deseja deletar a feature "${confirmarDialog.feature?.nome}"? Esta ação não pode ser desfeita.`}
        tipo={TIPOS_CONFIRMACAO.PERIGO}
        onConfirmar={executarDelecao}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar="Deletar"
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
};

export default FeaturesPage;
