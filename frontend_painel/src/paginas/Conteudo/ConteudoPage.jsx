/**
 * @file Página de Gerenciamento de Conteúdo
 * @description Interface completa de CRUD para conteúdo
 * 
 * @module paginas/Conteudo/ConteudoPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaFileAlt, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import ConteudoService from '../../servicos/conteudo';
import TemasService from '../../servicos/temas';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/ConteudoPage.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const PAGINACAO = {
  PAGINA_INICIAL: 1,
  ITENS_POR_PAGINA: 10,
};

const DURACAO_ALERTA = 3000;

const TIPOS_CONTEUDO = [
  { valor: 'texto', label: 'Texto' },
  { valor: 'imagem', label: 'Imagem' },
  { valor: 'vídeo', label: 'Vídeo' },
];

const FORM_INICIAL = {
  temaId: '',
  tipo: '',
  categoria: '',
  titulo: '',
  descricao: '',
  ordem: '',
  habilitado: true,
};

const COLUNAS_GRID = [
  { chave: 'titulo', titulo: 'Título', largura: '30%' },
  { chave: 'tipo', titulo: 'Tipo', largura: '20%' },
  { chave: 'categoria', titulo: 'Categoria', largura: '25%' },
  { chave: 'temaId', titulo: 'Tema', largura: '25%' },
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

  if (!dados.tipo?.trim()) {
    erros.tipo = 'Tipo é obrigatório';
  }

  if (!dados.categoria?.trim()) {
    erros.categoria = 'Categoria é obrigatória';
  }

  return erros;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página de Gerenciamento de Conteúdo
 * 
 * Funcionalidades completas de CRUD.
 * 
 * @component
 * @returns {JSX.Element}
 */
const ConteudoPage = () => {
  // Autenticação e Permissões
  const { usuario, temPermissao } = useAuth();
  
  // Estado
  const [conteudos, setConteudos] = useState([]);
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
  const [totalConteudos, setTotalConteudos] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    conteudo: null,
    carregando: false,
  });

  // Carregar conteúdos ao montar o componente
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
      const filtros = { search: filtro };
      
      // Se não é admin, filtrar pelo parceiro do usuário
      if (usuario?.tipo !== 'admin' && usuario?.parceiroId) {
        filtros.parceiroId = usuario.parceiroId;
      }
      
      const resultado = await ConteudoService.listar(pagina, itensPorPagina, filtros);

      if (resultado.sucesso) {
        setConteudos(resultado.dados);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalConteudos(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        setErro(resultado.erro || 'Erro ao carregar conteúdos');
      }
    } catch (err) {
      setErro('Erro inesperado ao carregar conteúdos');
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

  const abrirModalEditar = (conteudo) => {
    setEditando(conteudo.id);
    setFormData({
      temaId: conteudo.temaId || '',
      tipo: conteudo.tipo || '',
      categoria: conteudo.categoria || '',
      titulo: conteudo.titulo || '',
      descricao: conteudo.descricao || '',
      ordem: conteudo.ordem || '',
      habilitado: conteudo.habilitado !== false,
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

  const salvarConteudo = async () => {
    const erros = validarFormulario(formData);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);

    try {
      const resultado = editando
        ? await ConteudoService.atualizar(editando, formData)
        : await ConteudoService.criar(formData);

      if (resultado.sucesso) {
        const msg = editando ? 'Conteúdo atualizado com sucesso!' : 'Conteúdo criado com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar conteúdo'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao salvar conteúdo'));
      console.error('[ERRO]', err);
    } finally {
      setSalvando(false);
    }
  };

  // =========================================================================
  // AÇÕES
  // =========================================================================

  const abrirConfirmarDelecao = (conteudo) => {
    setConfirmarDialog({
      aberto: true,
      conteudo,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      conteudo: null,
      carregando: false,
    });
  };

  const executarDelecao = async () => {
    if (!confirmarDialog.conteudo) return;

    setConfirmarDialog(prev => ({ ...prev, carregando: true }));

    const conteudo = confirmarDialog.conteudo;

    try {
      const resultado = await ConteudoService.deletar(conteudo.id);

      if (resultado.sucesso) {
        setAlerta(criarAlerta('sucesso', 'Conteúdo deletado com sucesso!'));
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao deletar conteúdo'));
        setConfirmarDialog(prev => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao deletar conteúdo'));
      console.error('[ERRO]', err);
      setConfirmarDialog(prev => ({ ...prev, carregando: false }));
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="conteudo-page">
      {/* Header */}
      <div className="conteudo-header">
        <div className="conteudo-header-content">
          <div>
            <h1>
              <FaFileAlt /> Conteúdo
            </h1>
            <p>Gerenciar conteúdo do sistema</p>
          </div>
          {temPermissao('conteudo_criar') && (
            <button className="conteudo-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Novo Conteúdo
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`conteudo-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <div>
        <input
          type="text"
          placeholder="Buscar conteúdo..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="conteudo-filtro-input"
        />
      </div>

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={conteudos}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhum conteúdo encontrado"
        iconoVazio={<FaFileAlt />}
        totalItens={totalConteudos}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(conteudo) => (
          <div className="grid-actions-group">
            {temPermissao('conteudo_editar') && (
              <button
                onClick={() => abrirModalEditar(conteudo)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('conteudo_deletar') && (
              <button
                onClick={() => abrirConfirmarDelecao(conteudo)}
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
        titulo={editando ? 'Editar Conteúdo' : 'Novo Conteúdo'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button
              className="modal-btn-salvar"
              onClick={salvarConteudo}
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

          {/* Tipo e Categoria */}
          <div className="modal-form-row cols-2">
            <div className="modal-form-group">
              <label className="modal-form-label">Tipo <span className="required">*</span></label>
              <select
                className="modal-form-select"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value="">— Selecione um tipo —</option>
                {TIPOS_CONTEUDO.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errosForm.tipo && (
                <span className="modal-form-error">{errosForm.tipo}</span>
              )}
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Categoria <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                placeholder="Ex: destaque, promocao, noticia"
              />
              {errosForm.categoria && (
                <span className="modal-form-error">{errosForm.categoria}</span>
              )}
            </div>
          </div>

          {/* Título */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">Título</label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Digite o título do conteúdo..."
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">Descrição</label>
              <textarea
                className="modal-form-input modal-form-textarea"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Digite a descrição do conteúdo..."
                rows="4"
              />
            </div>
          </div>

          {/* Ordem e Habilitado */}
          <div className="modal-form-row cols-2">
            <div className="modal-form-group">
              <label className="modal-form-label">Ordem</label>
              <input
                type="number"
                className="modal-form-input"
                value={formData.ordem}
                onChange={(e) => setFormData({ ...formData, ordem: e.target.value })}
                placeholder="0"
              />
            </div>

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
        titulo="Deletar Conteúdo?"
        mensagem={`Tem certeza que deseja deletar o conteúdo "${confirmarDialog.conteudo?.titulo || 'sem título'}"? Esta ação não pode ser desfeita.`}
        tipo={TIPOS_CONFIRMACAO.PERIGO}
        onConfirmar={executarDelecao}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar="Deletar"
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
};

export default ConteudoPage;
