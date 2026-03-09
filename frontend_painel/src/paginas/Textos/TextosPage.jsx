/**
 * @file Página de Gerenciamento de Textos
 * @description Interface completa de CRUD para textos
 *
 * @module paginas/Textos/TextosPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaFont, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import TextosService from '../../servicos/textos';
import TemasService from '../../servicos/temas';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/TextosPage.css';

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
  chave: '',
  valor: '',
};

const COLUNAS_GRID = [
  { chave: 'chave', titulo: 'Chave', largura: '25%' },
  { chave: 'categoria', titulo: 'Categoria', largura: '25%' },
  { chave: 'temaId', titulo: 'Tema', largura: '25%' },
  {
    chave: 'valor',
    titulo: 'Valor',
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

  if (!dados.chave?.trim()) {
    erros.chave = 'Chave é obrigatória';
  }

  if (!dados.valor?.trim()) {
    erros.valor = 'Valor é obrigatório';
  }

  return erros;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página de Gerenciamento de Textos
 *
 * Funcionalidades completas de CRUD.
 *
 * @component
 * @returns {JSX.Element}
 */
const TextosPage = () => {
  // Autenticação e Permissões
  const { usuario, temPermissao } = useAuth();

  // Estado
  const [textos, setTextos] = useState([]);
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
  const [totalTextos, setTotalTextos] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    texto: null,
    carregando: false,
  });

  // Carregar textos ao montar o componente
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

      const resultado = await TextosService.listar(pagina, itensPorPagina, filtros);

      if (resultado.sucesso) {
        setTextos(resultado.dados);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalTextos(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        //         _setErro(resultado.erro || 'Erro ao carregar textos');
      }
    } catch (err) {
      //       _setErro('Erro inesperado ao carregar textos');
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

  const abrirModalEditar = (texto) => {
    setEditando(texto.id);
    setFormData({
      temaId: texto.temaId || '',
      categoria: texto.categoria || '',
      chave: texto.chave || '',
      valor: texto.valor || '',
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

  const salvarTexto = async () => {
    const erros = validarFormulario(formData);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);

    try {
      const resultado = editando
        ? await TextosService.atualizar(editando, formData)
        : await TextosService.criar(formData);

      if (resultado.sucesso) {
        const msg = editando ? 'Texto atualizado com sucesso!' : 'Texto criado com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar texto'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao salvar texto'));
      console.error('[ERRO]', err);
    } finally {
      setSalvando(false);
    }
  };

  // =========================================================================
  // AÇÕES
  // =========================================================================

  const abrirConfirmarDelecao = (texto) => {
    setConfirmarDialog({
      aberto: true,
      texto,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      texto: null,
      carregando: false,
    });
  };

  const executarDelecao = async () => {
    if (!confirmarDialog.texto) return;

    setConfirmarDialog((prev) => ({ ...prev, carregando: true }));

    const texto = confirmarDialog.texto;

    try {
      const resultado = await TextosService.deletar(texto.id);

      if (resultado.sucesso) {
        setAlerta(criarAlerta('sucesso', 'Texto deletado com sucesso!'));
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao deletar texto'));
        setConfirmarDialog((prev) => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao deletar texto'));
      console.error('[ERRO]', err);
      setConfirmarDialog((prev) => ({ ...prev, carregando: false }));
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="textos-page">
      {/* Header */}
      <div className="textos-header">
        <div className="textos-header-content">
          <div>
            <h1>
              <FaFont /> Textos
            </h1>
            <p>Gerenciar textos do sistema</p>
          </div>
          {temPermissao('textos_criar') && (
            <button className="textos-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Novo Texto
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`textos-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <div>
        <input
          type="text"
          placeholder="Buscar texto..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="textos-filtro-input"
        />
      </div>

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={textos}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhum texto encontrado"
        iconoVazio={<FaFont />}
        totalItens={totalTextos}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(texto) => (
          <div className="grid-actions-group">
            {temPermissao('textos_editar') && (
              <button
                onClick={() => abrirModalEditar(texto)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('textos_deletar') && (
              <button
                onClick={() => abrirConfirmarDelecao(texto)}
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
        titulo={editando ? 'Editar Texto' : 'Novo Texto'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button className="modal-btn-salvar" onClick={salvarTexto} disabled={salvando}>
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

          {/* Categoria e Chave */}
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
                placeholder="Ex: footer, header, menu"
              />
              {errosForm.categoria && (
                <span className="modal-form-error">{errosForm.categoria}</span>
              )}
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                Chave <span className="required">*</span>
              </label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.chave}
                onChange={(e) => setFormData({ ...formData, chave: e.target.value })}
                placeholder="Ex: copyright, description"
              />
              {errosForm.chave && <span className="modal-form-error">{errosForm.chave}</span>}
            </div>
          </div>

          {/* Valor */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">
                Valor <span className="required">*</span>
              </label>
              <textarea
                className="modal-form-textarea"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="Digite o conteúdo do texto..."
                rows="4"
              />
              {errosForm.valor && <span className="modal-form-error">{errosForm.valor}</span>}
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        aberto={confirmarDialog.aberto}
        titulo="Deletar Texto?"
        mensagem={`Tem certeza que deseja deletar o texto "${confirmarDialog.texto?.chave}"? Esta ação não pode ser desfeita.`}
        tipo={TIPOS_CONFIRMACAO.PERIGO}
        onConfirmar={executarDelecao}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar="Deletar"
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
};

export default TextosPage;
