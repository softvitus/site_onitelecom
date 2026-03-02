/**
 * @file Página de Gerenciamento de Páginas
 * @description Interface completa de CRUD para páginas
 * 
 * @module paginas/Paginas/PaginasPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBook } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import PaginasService from '../../servicos/paginas';
import ParceirosService from '../../servicos/parceiros';
import TemasService from '../../servicos/temas';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/PaginasPage.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const PAGINACAO = {
  PAGINA_INICIAL: 1,
  ITENS_POR_PAGINA: 10,
};

const DURACAO_ALERTA = 3000;

const STATUS_PAGINA = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  SUSPENSO: 'suspenso',
};

const FORM_INICIAL = {
  nome: '',
  caminho: '',
  titulo: '',
  parceiroId: '',
  temaId: '',
  status: STATUS_PAGINA.ATIVO,
  mostrarNoMenu: false,
  etiquetaMenu: '',
  ordemMenu: '',
  icone: '',
  categoria: '',
};

const COLUNAS_GRID = [
  { chave: 'nome', titulo: 'Nome', largura: '18%' },
  { chave: 'caminho', titulo: 'Caminho', largura: '18%' },
  {
    chave: 'status',
    titulo: 'Status',
    largura: '10%',
    render: (valor) => (
      <span className={`paginas-status paginas-status-${valor}`}>
        {valor === 'ativo' ? 'Ativo' : valor === 'inativo' ? 'Inativo' : 'Suspenso'}
      </span>
    ),
  },
  {
    chave: 'mostrarNoMenu',
    titulo: 'Menu',
    largura: '10%',
    render: (valor) => (
      <span className={`paginas-menu-badge ${valor ? 'sim' : 'nao'}`}>
        {valor ? 'Sim' : 'Não'}
      </span>
    ),
  },
  { chave: 'etiquetaMenu', titulo: 'Etiqueta', largura: '14%' },
  { chave: 'icone', titulo: 'Ícone', largura: '12%' },
  { chave: 'categoria', titulo: 'Categoria', largura: '12%' },
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

  if (!dados.nome?.trim()) {
    erros.nome = 'Nome é obrigatório';
  }

  if (!dados.caminho?.trim()) {
    erros.caminho = 'Caminho é obrigatório';
  }

  if (!dados.titulo?.trim()) {
    erros.titulo = 'Título é obrigatório';
  }

  if (!dados.parceiroId?.trim()) {
    erros.parceiroId = 'Parceiro é obrigatório';
  }

  if (!dados.temaId?.trim()) {
    erros.temaId = 'Tema é obrigatório';
  }

  return erros;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página de Gerenciamento de Páginas
 * 
 * Funcionalidades completas de CRUD com listagem em grid.
 * 
 * @component
 * @returns {JSX.Element}
 */
const PaginasPage = () => {
  // Autenticação e Permissões
  const { temPermissao } = useAuth();
  
  // Estado
  const [paginas, setPaginas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Paginação (gerenciada pelo Grid)
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalPaginasCount, setTotalPaginasCount] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [parceiros, setParceiros] = useState([]);
  const [temas, setTemas] = useState([]);
  const [carregandoParceiros, setCarregandoParceiros] = useState(false);
  const [carregandoTemas, setCarregandoTemas] = useState(false);
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    pagina: null,
    carregando: false,
  });

  // Carregar páginas e relacionamentos ao montar o componente
  useEffect(() => {
    carregarParceiros();
    carregarTemas();
    carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
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

  // Carregar lista de parceiros
  const carregarParceiros = async () => {
    setCarregandoParceiros(true);
    try {
      const resultado = await ParceirosService.listar(1, 1000);
      if (resultado.sucesso) {
        setParceiros(resultado.dados);
      }
    } catch (err) {
      console.error('[ERRO] Erro ao carregar parceiros:', err);
    } finally {
      setCarregandoParceiros(false);
    }
  };

  // Carregar lista de temas
  const carregarTemas = async () => {
    setCarregandoTemas(true);
    try {
      const resultado = await TemasService.listar(1, 1000);
      if (resultado.sucesso) {
        setTemas(resultado.dados);
      }
    } catch (err) {
      console.error('[ERRO] Erro ao carregar temas:', err);
    } finally {
      setCarregandoTemas(false);
    }
  };

  // Carregar dados para o Grid
  const carregarDadosGrid = async (pagina, itensPorPagina) => {
    setCarregando(true);
    setErro(null);

    try {
      const resultado = await PaginasService.listar(pagina, itensPorPagina, {
        search: filtro,
      });

      if (resultado.sucesso) {
        // Mapear páginas para adicionar nomes de relacionamentos
        const paginasComRelacoes = resultado.dados.map(pagina => ({
          ...pagina,
          parceiroNome: parceiros.find(p => p.id === pagina.parceiroId)?.nome || 'N/A',
          temaNome: temas.find(t => t.id === pagina.temaId)?.nome || 'N/A',
        }));
        setPaginas(paginasComRelacoes);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalPaginasCount(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        setErro(resultado.erro || 'Erro ao carregar páginas');
      }
    } catch (err) {
      setErro('Erro inesperado ao carregar páginas');
      console.error('[ERRO]', err);
    } finally {
      setCarregando(false);
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

  const abrirModalEditar = (pagina) => {
    setEditando(pagina.id);
    setFormData({
      nome: pagina.nome || '',
      caminho: pagina.caminho || '',
      titulo: pagina.titulo || '',
      parceiroId: pagina.parceiroId || '',
      temaId: pagina.temaId || '',
      status: pagina.status || STATUS_PAGINA.ATIVO,
      mostrarNoMenu: pagina.mostrarNoMenu || false,
      etiquetaMenu: pagina.etiquetaMenu || '',
      ordemMenu: pagina.ordemMenu || '',
      icone: pagina.icone || '',
      categoria: pagina.categoria || '',
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

  const salvarPagina = async () => {
    const erros = validarFormulario(formData);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);

    try {
      const resultado = editando
        ? await PaginasService.atualizar(editando, formData)
        : await PaginasService.criar(formData);

      if (resultado.sucesso) {
        const msg = editando ? 'Página atualizada com sucesso!' : 'Página criada com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar página'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao salvar página'));
      console.error('[ERRO]', err);
    } finally {
      setSalvando(false);
    }
  };

  const abrirConfirmarDelecao = (pagina) => {
    setConfirmarDialog({
      aberto: true,
      pagina,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      pagina: null,
      carregando: false,
    });
  };

  const executarDelecao = async () => {
    if (!confirmarDialog.pagina) return;

    setConfirmarDialog(prev => ({ ...prev, carregando: true }));

    try {
      const resultado = await PaginasService.deletar(confirmarDialog.pagina.id);

      if (resultado.sucesso) {
        setAlerta(criarAlerta('sucesso', 'Página deletada com sucesso!'));
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
        // Recarrega após fechar o dialog
        carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao deletar página'));
        setConfirmarDialog(prev => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao deletar página'));
      console.error('[ERRO]', err);
      setConfirmarDialog(prev => ({ ...prev, carregando: false }));
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="paginas-page">
      {/* Header */}
      <div className="paginas-header">
        <div className="paginas-header-content">
          <div>
            <h1>
              <FaBook /> Páginas
            </h1>
            <p>Gerenciar páginas do sistema</p>
          </div>
          {temPermissao('pagina_criar') && (
            <button className="paginas-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Nova Página
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`paginas-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <div>
        <input
          type="text"
          placeholder="Buscar página..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="paginas-filtro-input"
        />
      </div>

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={paginas}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhuma página encontrada"
        iconoVazio={<FaBook />}
        totalItens={totalPaginasCount}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(pagina) => (
          <div className="grid-actions-group">
            {temPermissao('pagina_editar') && (
              <button
                onClick={() => abrirModalEditar(pagina)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('pagina_deletar') && (
              <button
                onClick={() => abrirConfirmarDelecao(pagina)}
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
        titulo={editando ? 'Editar Página' : 'Nova Página'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button
              className="modal-btn-salvar"
              onClick={salvarPagina}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        }
      >
        <form className="modal-form">
          {/* Nome, Caminho, Título, Status */}
          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">Nome <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome da página"
              />
              {errosForm.nome && (
                <span className="modal-form-error">{errosForm.nome}</span>
              )}
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Caminho <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.caminho}
                onChange={(e) => setFormData({ ...formData, caminho: e.target.value })}
                placeholder="/exemplo"
              />
              {errosForm.caminho && (
                <span className="modal-form-error">{errosForm.caminho}</span>
              )}
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Título <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Título da página"
              />
              {errosForm.titulo && (
                <span className="modal-form-error">{errosForm.titulo}</span>
              )}
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Status</label>
              <select
                className="modal-form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value={STATUS_PAGINA.ATIVO}>Ativo</option>
                <option value={STATUS_PAGINA.INATIVO}>Inativo</option>
                <option value={STATUS_PAGINA.SUSPENSO}>Suspenso</option>
              </select>
            </div>
          </div>

          {/* Parceiro, Tema, Exibir Menu, Etiqueta */}
          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">Parceiro <span className="required">*</span></label>
              <select
                className="modal-form-select"
                value={formData.parceiroId}
                onChange={(e) => setFormData({ ...formData, parceiroId: e.target.value })}
                disabled={carregandoParceiros}
              >
                <option value="">Selecione um parceiro...</option>
                {parceiros.map((parceiro) => (
                  <option key={parceiro.id} value={parceiro.id}>
                    {parceiro.nome}
                  </option>
                ))}
              </select>
              {errosForm.parceiroId && (
                <span className="modal-form-error">{errosForm.parceiroId}</span>
              )}
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Tema <span className="required">*</span></label>
              <select
                className="modal-form-select"
                value={formData.temaId}
                onChange={(e) => setFormData({ ...formData, temaId: e.target.value })}
                disabled={carregandoTemas}
              >
                <option value="">Selecione um tema...</option>
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
            <div className="modal-form-group">
              <label className="modal-form-label">Exibir no Menu</label>
              <select
                className="modal-form-select"
                value={formData.mostrarNoMenu ? 'sim' : 'nao'}
                onChange={(e) => setFormData({ ...formData, mostrarNoMenu: e.target.value === 'sim' })}
              >
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Etiqueta do Menu</label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.etiquetaMenu}
                onChange={(e) => setFormData({ ...formData, etiquetaMenu: e.target.value })}
                placeholder="Label no menu"
              />
            </div>
          </div>

          {/* Ordem, Ícone, Categoria */}
          <div className="modal-form-row cols-3">
            <div className="modal-form-group">
              <label className="modal-form-label">Ordem no Menu</label>
              <input
                type="number"
                className="modal-form-input"
                value={formData.ordemMenu}
                onChange={(e) => setFormData({ ...formData, ordemMenu: e.target.value })}
                placeholder="1, 2, 3..."
                min="0"
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Ícone</label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.icone}
                onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                placeholder="fa-home, fa-user..."
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Categoria</label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                placeholder="Ex: Principal, Institucional..."
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        aberto={confirmarDialog.aberto}
        titulo="Deletar Página?"
        mensagem={`Tem certeza que deseja deletar a página "${confirmarDialog.pagina?.nome}"? Esta ação não pode ser desfeita.`}
        tipo={TIPOS_CONFIRMACAO.PERIGO}
        onConfirmar={executarDelecao}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar="Deletar"
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
}
export default PaginasPage;