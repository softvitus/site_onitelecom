/**
 * @file Página de Gerenciamento de Elementos
 * @description Interface completa de CRUD para elementos
 * 
 * @module paginas/Elementos/ElementosPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaToggleOn, FaCircle, FaSearch } from 'react-icons/fa';
import { FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import ElementosService from '../../servicos/elementos';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/ElementosPage.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const PAGINACAO = {
  PAGINA_INICIAL: 1,
  ITENS_POR_PAGINA: 10,
};

const DURACAO_ALERTA = 3000;

const FORM_INICIAL = {
  nome: '',
  descricao: '',
  ativo: true,
  obrigatorio: false,
};

const COLUNAS_GRID = [
  { chave: 'nome', titulo: 'Nome', largura: '30%' },
  { chave: 'descricao', titulo: 'Descrição', largura: '40%' },
  {
    chave: 'obrigatorio',
    titulo: 'Obrigatório',
    largura: '10%',
    render: (valor) => (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '500',
        backgroundColor: valor === true ? '#dcfce7' : '#f3f4f6',
        color: valor === true ? '#166534' : '#6b7280',
      }}>
        {valor === true ? <FiCheck size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> : <FiX size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
        {valor === true ? 'Sim' : 'Não'}
      </span>
    ),
  },
  {
    chave: 'ativo',
    titulo: 'Status',
    largura: '10%',
    render: (valor) => (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '500',
        backgroundColor: valor === true ? '#dcfce7' : '#fee2e2',
        color: valor === true ? '#166534' : '#991b1b',
      }}>
        {valor === true ? (
          <><FiCheck size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Ativo</>
        ) : (
          <><FiX size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Inativo</>
        )}
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

  if (!dados.nome?.trim()) {
    erros.nome = 'Nome é obrigatório';
  }

  return erros;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página de Gerenciamento de Elementos
 * 
 * Funcionalidades completas de CRUD.
 * 
 * @component
 * @returns {JSX.Element}
 */
const ElementosPage = () => {
  // Autenticação e Permissões
  const { usuario, temPermissao } = useAuth();
  
  // Estado
  const [elementos, setElementos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Paginação (gerenciada pelo Grid)
  const [totalElementos, setTotalElementos] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    elemento: null,
    carregando: false,
  });

  // Carregar elementos ao montar o componente
  useEffect(() => {
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
      
      const resultado = await ElementosService.listar(pagina, itensPorPagina, filtros);

      if (resultado.sucesso) {
        setElementos(resultado.dados);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalElementos(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        setErro(resultado.erro || 'Erro ao carregar elementos');
      }
    } catch (err) {
      setErro('Erro inesperado ao carregar elementos');
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

  const abrirModalEditar = (elemento) => {
    setEditando(elemento.id);
    setFormData({
      nome: elemento.nome || '',
      descricao: elemento.descricao || '',
      ativo: elemento.ativo !== false,
      obrigatorio: elemento.obrigatorio || false,
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

  const salvarElemento = async () => {
    const erros = validarFormulario(formData);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);

    try {
      const resultado = editando
        ? await ElementosService.atualizar(editando, formData)
        : await ElementosService.criar(formData);

      if (resultado.sucesso) {
        const msg = editando ? 'Elemento atualizado com sucesso!' : 'Elemento criado com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar elemento'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao salvar elemento'));
      console.error('[ERRO]', err);
    } finally {
      setSalvando(false);
    }
  };

  // =========================================================================
  // AÇÕES
  // =========================================================================

  const abrirConfirmarAlterarStatus = (elemento) => {
    setConfirmarDialog({
      aberto: true,
      elemento,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      elemento: null,
      carregando: false,
    });
  };

  const executarAlterarStatus = async () => {
    if (!confirmarDialog.elemento) return;

    setConfirmarDialog(prev => ({ ...prev, carregando: true }));

    const elemento = confirmarDialog.elemento;
    const novoAtivo = !elemento.ativo;

    try {
      const resultado = await ElementosService.atualizar(elemento.id, {
        ...elemento,
        ativo: novoAtivo,
      });

      if (resultado.sucesso) {
        const alerta =
          novoAtivo === true
            ? 'Elemento ativado com sucesso!'
            : 'Elemento desativado com sucesso!';
        setAlerta(criarAlerta('sucesso', alerta));
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao alterar status'));
        setConfirmarDialog(prev => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao alterar status do elemento'));
      console.error('[ERRO]', err);
      setConfirmarDialog(prev => ({ ...prev, carregando: false }));
    }
  };

  const alternarStatusElemento = (elemento) => {
    abrirConfirmarAlterarStatus(elemento);
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="elementos-page">
      {/* Header */}
      <div className="elementos-header">
        <div className="elementos-header-content">
          <div>
            <h1>
              <FaCircle /> Elementos
            </h1>
            <p>Gerenciar elementos do sistema</p>
          </div>
          {temPermissao('elemento_criar') && (
            <button className="elementos-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Novo Elemento
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`elementos-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <div>
        <input
          type="text"
          placeholder="Buscar elemento..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="elementos-filtro-input"
        />
      </div>

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={elementos}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhum elemento encontrado"
        iconoVazio={<FaCircle />}
        totalItens={totalElementos}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(elemento) => (
          <div className="grid-actions-group">
            {temPermissao('elemento_editar') && (
              <button
                onClick={() => abrirModalEditar(elemento)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('elemento_editar') && (
              <button
                onClick={() => alternarStatusElemento(elemento)}
                className={`grid-btn-action ${elemento.ativo === true ? 'grid-btn-action-toggle-ativo' : 'grid-btn-action-toggle-inativo'}`}
                title={elemento.ativo === true ? 'Inativar' : 'Ativar'}
              >
                <FaToggleOn />
              </button>
            )}
          </div>
        )}
      />

      {/* Modal */}
      <Modal
        aberto={modalAberto}
        onClose={fecharModal}
        titulo={editando ? 'Editar Elemento' : 'Novo Elemento'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button
              className="modal-btn-salvar"
              onClick={salvarElemento}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        }
      >
        <form className="modal-form">
          {/* Nome com Checkboxes - mesma linha */}
          <div className="modal-form-row cols-4">
            <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="modal-form-label">Nome <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: campo de email, botão de envio"
              />
              {errosForm.nome && (
                <span className="modal-form-error">{errosForm.nome}</span>
              )}
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <input
                  type="checkbox"
                  checked={formData.obrigatorio}
                  onChange={(e) => setFormData({ ...formData, obrigatorio: e.target.checked })}
                />
                Obrigatório
              </label>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                />
                Ativo
              </label>
            </div>
          </div>

          {/* Descrição - full width */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">Descrição</label>
              <textarea
                className="modal-form-textarea"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição detalhada do elemento e sua funcionalidade"
                rows={3}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        aberto={confirmarDialog.aberto}
        titulo={confirmarDialog.elemento?.ativo === true ? 'Inativar Elemento?' : 'Ativar Elemento?'}
        mensagem={`Tem certeza que deseja ${confirmarDialog.elemento?.ativo === true ? 'inativar' : 'ativar'} o elemento "${confirmarDialog.elemento?.nome}"?`}
        tipo={confirmarDialog.elemento?.ativo === true ? TIPOS_CONFIRMACAO.PERIGO : TIPOS_CONFIRMACAO.SUCESSO}
        onConfirmar={executarAlterarStatus}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar={confirmarDialog.elemento?.ativo === true ? 'Inativar' : 'Ativar'}
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
};

export default ElementosPage;
