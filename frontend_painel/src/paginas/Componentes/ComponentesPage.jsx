/**
 * @file Página de Gerenciamento de Componentes
 * @description Interface completa de CRUD para componentes
 * 
 * @module paginas/Componentes/ComponentesPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaToggleOn, FaCube, FaSearch } from 'react-icons/fa';
import { FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import ComponentesService from '../../servicos/componentes';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/ComponentesPage.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const PAGINACAO = {
  PAGINA_INICIAL: 1,
  ITENS_POR_PAGINA: 10,
};

const DURACAO_ALERTA = 3000;

const TIPOS_COMPONENTES = [
  { valor: 'global', label: 'Global' },
  { valor: 'reutilizável', label: 'Reutilizável' },
  { valor: 'específico', label: 'Específico' },
];

const FORM_INICIAL = {
  nome: '',
  descricao: '',
  tipo: 'reutilizável',
  possuiElementos: false,
  ativo: true,
};

const COLUNAS_GRID = [
  { chave: 'nome', titulo: 'Nome', largura: '25%' },
  { chave: 'descricao', titulo: 'Descrição', largura: '35%' },
  { chave: 'tipo', titulo: 'Tipo', largura: '15%' },
  {
    chave: 'ativo',
    titulo: 'Status',
    largura: '15%',
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
 * Página de Gerenciamento de Componentes
 * 
 * Funcionalidades completas de CRUD.
 * 
 * @component
 * @returns {JSX.Element}
 */
const ComponentesPage = () => {
  // Autenticação e Permissões
  const { usuario, temPermissao } = useAuth();
  
  // Estado
  const [componentes, setComponentes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [_erro, _setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Paginação (gerenciada pelo Grid)
  const [totalComponentes, setTotalComponentes] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    componente: null,
    carregando: false,
  });

  // Carregar componentes ao montar o componente
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
    //     _setErro(null);

    try {
      const filtros = { search: filtro };
      
      // Se não é admin, filtrar pelo parceiro do usuário
      if (usuario?.tipo !== 'admin' && usuario?.parceiroId) {
        filtros.parceiroId = usuario.parceiroId;
      }
      
      const resultado = await ComponentesService.listar(pagina, itensPorPagina, filtros);

      if (resultado.sucesso) {
        setComponentes(resultado.dados);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalComponentes(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        //         _setErro(resultado.erro || 'Erro ao carregar componentes');
      }
    } catch (err) {
      //       _setErro('Erro inesperado ao carregar componentes');
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

  const abrirModalEditar = (componente) => {
    setEditando(componente.id);
    setFormData({
      nome: componente.nome || '',
      descricao: componente.descricao || '',
      tipo: componente.tipo || 'reutilizável',
      possuiElementos: componente.possuiElementos || false,
      ativo: componente.ativo !== false,
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

  const salvarComponente = async () => {
    const erros = validarFormulario(formData);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);

    try {
      const resultado = editando
        ? await ComponentesService.atualizar(editando, formData)
        : await ComponentesService.criar(formData);

      if (resultado.sucesso) {
        const msg = editando ? 'Componente atualizado com sucesso!' : 'Componente criado com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar componente'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao salvar componente'));
      console.error('[ERRO]', err);
    } finally {
      setSalvando(false);
    }
  };

  // =========================================================================
  // AÇÕES
  // =========================================================================

  const abrirConfirmarAlterarStatus = (componente) => {
    setConfirmarDialog({
      aberto: true,
      componente,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      componente: null,
      carregando: false,
    });
  };

  const executarAlterarStatus = async () => {
    if (!confirmarDialog.componente) return;

    setConfirmarDialog(prev => ({ ...prev, carregando: true }));

    const componente = confirmarDialog.componente;
    const novoAtivo = !componente.ativo;

    try {
      const resultado = await ComponentesService.atualizar(componente.id, {
        ...componente,
        ativo: novoAtivo,
      });

      if (resultado.sucesso) {
        const alerta =
          novoAtivo === true
            ? 'Componente ativado com sucesso!'
            : 'Componente desativado com sucesso!';
        setAlerta(criarAlerta('sucesso', alerta));
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao alterar status'));
        setConfirmarDialog(prev => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao alterar status do componente'));
      console.error('[ERRO]', err);
      setConfirmarDialog(prev => ({ ...prev, carregando: false }));
    }
  };

  const alternarStatusComponente = (componente) => {
    abrirConfirmarAlterarStatus(componente);
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="componentes-page">
      {/* Header */}
      <div className="componentes-header">
        <div className="componentes-header-content">
          <div>
            <h1>
              <FaCube /> Componentes
            </h1>
            <p>Gerenciar componentes do sistema</p>
          </div>
          {temPermissao('componente_criar') && (
            <button className="componentes-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Novo Componente
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`componentes-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <div>
        <input
          type="text"
          placeholder="Buscar componente..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="componentes-filtro-input"
        />
      </div>

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={componentes}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhum componente encontrado"
        iconoVazio={<FaCube />}
        totalItens={totalComponentes}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(componente) => (
          <div className="grid-actions-group">
            {temPermissao('componente_editar') && (
              <button
                onClick={() => abrirModalEditar(componente)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('componente_editar') && (
              <button
                onClick={() => alternarStatusComponente(componente)}
                className={`grid-btn-action ${componente.ativo === true ? 'grid-btn-action-toggle-ativo' : 'grid-btn-action-toggle-inativo'}`}
                title={componente.ativo === true ? 'Inativar' : 'Ativar'}
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
        titulo={editando ? 'Editar Componente' : 'Novo Componente'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button
              className="modal-btn-salvar"
              onClick={salvarComponente}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        }
      >
        <form className="modal-form">
          {/* Nome - full width */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">Nome <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: header, footer, carousel"
              />
              {errosForm.nome && (
                <span className="modal-form-error">{errosForm.nome}</span>
              )}
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
                placeholder="Descrição detalhada do componente e sua funcionalidade"
                rows={3}
              />
            </div>
          </div>

          {/* Linha com Tipo, Possui Elementos, Ativo */}
          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">Tipo</label>
              <select
                className="modal-form-select"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value="">— Selecione —</option>
                {TIPOS_COMPONENTES.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <input
                  type="checkbox"
                  checked={formData.possuiElementos}
                  onChange={(e) => setFormData({ ...formData, possuiElementos: e.target.checked })}
                />
                Possui Elementos
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
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        aberto={confirmarDialog.aberto}
        titulo={confirmarDialog.componente?.ativo === true ? 'Inativar Componente?' : 'Ativar Componente?'}
        mensagem={`Tem certeza que deseja ${confirmarDialog.componente?.ativo === true ? 'inativar' : 'ativar'} o componente "${confirmarDialog.componente?.nome}"?`}
        tipo={confirmarDialog.componente?.ativo === true ? TIPOS_CONFIRMACAO.PERIGO : TIPOS_CONFIRMACAO.SUCESSO}
        onConfirmar={executarAlterarStatus}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar={confirmarDialog.componente?.ativo === true ? 'Inativar' : 'Ativar'}
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
};

export default ComponentesPage;
