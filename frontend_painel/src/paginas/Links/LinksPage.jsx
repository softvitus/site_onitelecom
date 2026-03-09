/**
 * @file Página de Gerenciamento de Links
 * @description Interface completa de CRUD para links
 *
 * @module paginas/Links/LinksPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaLink, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import LinksService from '../../servicos/links';
import TemasService from '../../servicos/temas';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/LinksPage.css';

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
  categoria: '',
  nome: '',
  valor: '',
};

const COLUNAS_GRID = [
  { chave: 'nome', titulo: 'Nome', largura: '25%' },
  { chave: 'categoria', titulo: 'Categoria', largura: '25%' },
  { chave: 'temaId', titulo: 'Tema', largura: '25%' },
  {
    chave: 'valor',
    titulo: 'URL/Valor',
    largura: '25%',
    render: (valor) => (
      <span
        style={{
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'inline-block',
          title: valor,
        }}
      >
        {valor.length > 40 ? `${valor.substring(0, 40)}...` : valor}
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

  if (!dados.categoria?.trim()) {
    erros.categoria = 'Categoria é obrigatória';
  }

  if (!dados.nome?.trim()) {
    erros.nome = 'Nome é obrigatório';
  }

  if (!dados.valor?.trim()) {
    erros.valor = 'URL/Valor é obrigatório';
  }

  return erros;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página de Gerenciamento de Links
 *
 * Funcionalidades completas de CRUD.
 *
 * @component
 * @returns {JSX.Element}
 */
const LinksPage = () => {
  // Autenticação e Permissões
  const { usuario, temPermissao } = useAuth();

  // Estado
  const [links, setLinks] = useState([]);
  const [temas, setTemas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoTemas, setCarregandoTemas] = useState(false);
  const [_erro, _setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Paginação (gerenciada pelo Grid)
  const [totalLinks, setTotalLinks] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    link: null,
    carregando: false,
  });

  // Carregar links ao montar o componente
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
    //     _setErro(null);

    try {
      const filtros = { search: filtro };

      // Se não é admin, filtrar pelo parceiro do usuário
      if (usuario?.tipo !== 'admin' && usuario?.parceiroId) {
        filtros.parceiroId = usuario.parceiroId;
      }

      const resultado = await LinksService.listar(pagina, itensPorPagina, filtros);

      if (resultado.sucesso) {
        setLinks(resultado.dados);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalLinks(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        //         _setErro(resultado.erro || 'Erro ao carregar links');
      }
    } catch (err) {
      //       _setErro('Erro inesperado ao carregar links');
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

  const abrirModalEditar = (link) => {
    setEditando(link.id);
    setFormData({
      temaId: link.temaId || '',
      categoria: link.categoria || '',
      nome: link.nome || '',
      valor: link.valor || '',
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

  const salvarLink = async () => {
    const erros = validarFormulario(formData);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);

    try {
      const resultado = editando
        ? await LinksService.atualizar(editando, formData)
        : await LinksService.criar(formData);

      if (resultado.sucesso) {
        const msg = editando ? 'Link atualizado com sucesso!' : 'Link criado com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar link'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao salvar link'));
      console.error('[ERRO]', err);
    } finally {
      setSalvando(false);
    }
  };

  // =========================================================================
  // AÇÕES
  // =========================================================================

  const abrirConfirmarDelecao = (link) => {
    setConfirmarDialog({
      aberto: true,
      link,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      link: null,
      carregando: false,
    });
  };

  const executarDelecao = async () => {
    if (!confirmarDialog.link) return;

    setConfirmarDialog((prev) => ({ ...prev, carregando: true }));

    const link = confirmarDialog.link;

    try {
      const resultado = await LinksService.deletar(link.id);

      if (resultado.sucesso) {
        setAlerta(criarAlerta('sucesso', 'Link deletado com sucesso!'));
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao deletar link'));
        setConfirmarDialog((prev) => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao deletar link'));
      console.error('[ERRO]', err);
      setConfirmarDialog((prev) => ({ ...prev, carregando: false }));
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="links-page">
      {/* Header */}
      <div className="links-header">
        <div className="links-header-content">
          <div>
            <h1>
              <FaLink /> Links
            </h1>
            <p>Gerenciar links do sistema</p>
          </div>
          {temPermissao('links_criar') && (
            <button className="links-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Novo Link
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`links-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <div>
        <input
          type="text"
          placeholder="Buscar link..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="links-filtro-input"
        />
      </div>

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={links}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhum link encontrado"
        iconoVazio={<FaLink />}
        totalItens={totalLinks}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(link) => (
          <div className="grid-actions-group">
            {temPermissao('links_editar') && (
              <button
                onClick={() => abrirModalEditar(link)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('links_deletar') && (
              <button
                onClick={() => abrirConfirmarDelecao(link)}
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
        titulo={editando ? 'Editar Link' : 'Novo Link'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button className="modal-btn-salvar" onClick={salvarLink} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        }
      >
        <form className="modal-form">
          {/* Tema - obrigatório */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">
                Tema <span className="required">*</span>
              </label>
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
              {errosForm.temaId && <span className="modal-form-error">{errosForm.temaId}</span>}
            </div>
          </div>

          {/* Categoria e Nome */}
          <div className="modal-form-row cols-2">
            <div className="modal-form-group">
              <label className="modal-form-label">
                Categoria <span className="required">*</span>
              </label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                placeholder="Ex: social, externo, interno"
              />
              {errosForm.categoria && (
                <span className="modal-form-error">{errosForm.categoria}</span>
              )}
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                Nome <span className="required">*</span>
              </label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Facebook, GitHub, Site Externo"
              />
              {errosForm.nome && <span className="modal-form-error">{errosForm.nome}</span>}
            </div>
          </div>

          {/* URL/Valor */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">
                URL/Valor <span className="required">*</span>
              </label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="Ex: https://facebook.com/seu-pagina"
              />
              {errosForm.valor && <span className="modal-form-error">{errosForm.valor}</span>}
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        aberto={confirmarDialog.aberto}
        titulo="Deletar Link?"
        mensagem={`Tem certeza que deseja deletar o link "${confirmarDialog.link?.nome}"? Esta ação não pode ser desfeita.`}
        tipo={TIPOS_CONFIRMACAO.PERIGO}
        onConfirmar={executarDelecao}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar="Deletar"
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
};

export default LinksPage;
