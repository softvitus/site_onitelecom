/**
 * @file Página de Gerenciamento de Usuários
 * @description Interface completa de CRUD para usuários
 * 
 * @module paginas/Usuarios/UsuariosPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaToggleOn, FaUsers } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import UsuariosService from '../../servicos/usuarios';
import ParceirosService from '../../servicos/parceiros';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/UsuariosPage.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const PAGINACAO = {
  PAGINA_INICIAL: 1,
  ITENS_POR_PAGINA: 10,
};

const DURACAO_ALERTA = 3000;

const STATUS_USUARIO = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
};

const TIPOS_USUARIO = {
  ADMIN: 'admin',
  GESTOR: 'gestor',
  USUARIO: 'usuario',
};

const FORM_INICIAL = {
  nome: '',
  email: '',
  senha: '',
  telefone: '',
  tipo: TIPOS_USUARIO.USUARIO,
  status: STATUS_USUARIO.ATIVO,
  parceiroId: '',
};

const COLUNAS_GRID = [
  { chave: 'nome', titulo: 'Nome', largura: '25%' },
  { chave: 'email', titulo: 'Email', largura: '30%' },
  { chave: 'telefone', titulo: 'Telefone', largura: '15%' },
  {
    chave: 'tipo',
    titulo: 'Tipo',
    largura: '15%',
    render: (valor) => (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: valor === TIPOS_USUARIO.ADMIN ? '#fee2e2' : 
                         valor === TIPOS_USUARIO.GESTOR ? '#fef3c7' : '#dcfce7',
        color: valor === TIPOS_USUARIO.ADMIN ? '#991b1b' : 
               valor === TIPOS_USUARIO.GESTOR ? '#b45309' : '#166534',
      }}>
        {valor === TIPOS_USUARIO.ADMIN ? 'Admin' : 
         valor === TIPOS_USUARIO.GESTOR ? 'Gestor' : 'Usuário'}
      </span>
    ),
  },
  {
    chave: 'status',
    titulo: 'Status',
    largura: '15%',
    render: (valor) => (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: valor === STATUS_USUARIO.ATIVO ? '#dcfce7' : '#fee2e2',
        color: valor === STATUS_USUARIO.ATIVO ? '#166534' : '#991b1b',
      }}>
        {valor === STATUS_USUARIO.ATIVO ? 'Ativo' : 'Inativo'}
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
 * @param {boolean} criando - Se está criando (senha obrigatória)
 * @returns {Object} Dicionário de erros
 */
const validarFormulario = (dados, criando = false) => {
  const erros = {};

  if (!dados.nome?.trim()) {
    erros.nome = 'Nome é obrigatório';
  }

  if (!dados.email?.trim()) {
    erros.email = 'Email é obrigatório';
  } else if (!dados.email.includes('@')) {
    erros.email = 'Email inválido';
  }

  if (criando && !dados.senha?.trim()) {
    erros.senha = 'Senha é obrigatória';
  }

  if (dados.senha && dados.senha.length < 6 && dados.senha.length > 0) {
    erros.senha = 'Senha deve ter no mínimo 6 caracteres';
  }

  // Parceiro é obrigatório para gestor e usuario
  if (dados.tipo !== TIPOS_USUARIO.ADMIN && !dados.parceiroId?.trim()) {
    erros.parceiroId = 'Parceiro é obrigatório para Gestor e Usuário';
  }

  return erros;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página de Gerenciamento de Usuários
 * 
 * Funcionalidades completas de CRUD para usuários.
 * 
 * @component
 * @returns {JSX.Element}
 */
const UsuariosPage = () => {
  // Autenticação e Permissões
  const { temPermissao } = useAuth();
  
  // Estado
  const [usuarios, setUsuarios] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Paginação
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    usuario: null,
    carregando: false,
  });

  // Carregar usuários ao montar o componente
  useEffect(() => {
    carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
    // Só carrega parceiros se tiver permissão
    if (temPermissao && temPermissao('parceiro_listar')) {
      carregarParceiros();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carregar parceiros
  const carregarParceiros = async () => {
    try {
      const resultado = await ParceirosService.listar(1, 1000);
      if (resultado.sucesso) {
        setParceiros(resultado.dados || []);
      }
    } catch (err) {
      console.error('[ERRO] ao carregar parceiros:', err);
    }
  };

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
      const resultado = await UsuariosService.listar(pagina, itensPorPagina, {
        search: filtro,
      });

      if (resultado.sucesso) {
        setUsuarios(resultado.dados);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalUsuarios(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        setErro(resultado.erro || 'Erro ao carregar usuários');
      }
    } catch (err) {
      setErro('Erro inesperado ao carregar usuários');
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

  const abrirModalEditar = (usuario) => {
    setEditando(usuario.id);
    setFormData({
      nome: usuario.nome || '',
      email: usuario.email || '',
      senha: '', // Não preenchemos senha ao editar
      telefone: usuario.telefone || '',
      tipo: usuario.tipo || TIPOS_USUARIO.USUARIO,
      status: usuario.status || STATUS_USUARIO.ATIVO,
      parceiroId: usuario.parceiroId || '',
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

  const salvarUsuario = async () => {
    const erros = validarFormulario(formData, !editando);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);

    try {
      const resultado = editando
        ? await UsuariosService.atualizar(editando, formData)
        : await UsuariosService.criar(formData);

      if (resultado.sucesso) {
        const msg = editando ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar usuário'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao salvar usuário'));
      console.error('[ERRO]', err);
    } finally {
      setSalvando(false);
    }
  };

  // =========================================================================
  // AÇÕES
  // =========================================================================

  const abrirConfirmarAlterarStatus = (usuario) => {
    setConfirmarDialog({
      aberto: true,
      usuario,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      usuario: null,
      carregando: false,
    });
  };

  const executarAlterarStatus = async () => {
    if (!confirmarDialog.usuario) return;

    setConfirmarDialog(prev => ({ ...prev, carregando: true }));

    const usuario = confirmarDialog.usuario;
    const novoStatus =
      usuario.status === STATUS_USUARIO.ATIVO ? STATUS_USUARIO.INATIVO : STATUS_USUARIO.ATIVO;

    try {
      const resultado = await UsuariosService.atualizarStatus(usuario.id, novoStatus);

      if (resultado.sucesso) {
        const alerta =
          novoStatus === STATUS_USUARIO.ATIVO
            ? 'Usuário ativado com sucesso!'
            : 'Usuário desativado com sucesso!';
        setAlerta(criarAlerta('sucesso', alerta));
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao alterar status'));
        setConfirmarDialog(prev => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao alterar status do usuário'));
      console.error('[ERRO]', err);
      setConfirmarDialog(prev => ({ ...prev, carregando: false }));
    }
  };

  const alternarStatusUsuario = (usuario) => {
    abrirConfirmarAlterarStatus(usuario);
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="usuarios-page">
      {/* Header */}
      <div className="usuarios-header">
        <div className="usuarios-header-content">
          <div>
            <h1>
              <FaUsers /> Usuários
            </h1>
            <p>Gerenciar usuários do sistema</p>
          </div>
          {temPermissao('usuario_criar') && (
            <button className="usuarios-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Novo Usuário
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`usuarios-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <input
        type="text"
        placeholder="Buscar usuário..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="usuarios-filtro-input"
      />

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={usuarios}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhum usuário encontrado"
        iconoVazio={<FaUsers />}
        totalItens={totalUsuarios}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(usuario) => (
          <div className="grid-actions-group">
            {temPermissao('usuario_editar') && (
              <button
                onClick={() => abrirModalEditar(usuario)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('usuario_editar') && (
              <button
                onClick={() => alternarStatusUsuario(usuario)}
                className={`grid-btn-action ${usuario.status === STATUS_USUARIO.ATIVO ? 'grid-btn-action-toggle-ativo' : 'grid-btn-action-toggle-inativo'}`}
                title={usuario.status === STATUS_USUARIO.ATIVO ? 'Inativar' : 'Ativar'}
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
        titulo={editando ? 'Editar Usuário' : 'Novo Usuário'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button
              className="modal-btn-salvar"
              onClick={salvarUsuario}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        }
      >
        <form className="modal-form">
          {/* Linha 1: Nome e Email */}
          <div className="modal-form-row cols-2">
            <div className="modal-form-group">
              <label className="modal-form-label">Nome <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome completo"
              />
              {errosForm.nome && (
                <span className="modal-form-error">{errosForm.nome}</span>
              )}
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Email <span className="required">*</span></label>
              <input
                type="email"
                className="modal-form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@example.com"
              />
              {errosForm.email && (
                <span className="modal-form-error">{errosForm.email}</span>
              )}
            </div>
          </div>

          {/* Linha 2: Senha e Telefone */}
          <div className="modal-form-row cols-2">
            <div className="modal-form-group">
              <label className="modal-form-label">
                Senha {editando ? '(deixe vazio para não alterar)' : <span className="required">*</span>}
              </label>
              <input
                type="password"
                className="modal-form-input"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                placeholder="••••••••"
              />
              {errosForm.senha && (
                <span className="modal-form-error">{errosForm.senha}</span>
              )}
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Telefone</label>
              <input
                type="tel"
                className="modal-form-input"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Linha 3: Tipo de Usuário e Status */}
          <div className="modal-form-row cols-2">
            <div className="modal-form-group">
              <label className="modal-form-label">Tipo de Usuário</label>
              <select
                className="modal-form-select"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value={TIPOS_USUARIO.USUARIO}>Usuário</option>
                <option value={TIPOS_USUARIO.GESTOR}>Gestor</option>
                <option value={TIPOS_USUARIO.ADMIN}>Admin</option>
              </select>
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Status</label>
              <select
                className="modal-form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value={STATUS_USUARIO.ATIVO}>Ativo</option>
                <option value={STATUS_USUARIO.INATIVO}>Inativo</option>
              </select>
            </div>
          </div>

          {/* Linha 4: Parceiro */}
          {formData.tipo !== TIPOS_USUARIO.ADMIN && (
            <div className="modal-form-row cols-1">
              <div className="modal-form-group">
                <label className="modal-form-label">
                  Parceiro {formData.tipo !== TIPOS_USUARIO.ADMIN && <span className="required">*</span>}
                </label>
                <select
                  className="modal-form-select"
                  value={formData.parceiroId}
                  onChange={(e) => setFormData({ ...formData, parceiroId: e.target.value })}
                >
                  <option value="">Selecione um parceiro</option>
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
            </div>
          )}
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        aberto={confirmarDialog.aberto}
        titulo={confirmarDialog.usuario?.status === STATUS_USUARIO.ATIVO ? 'Inativar Usuário?' : 'Ativar Usuário?'}
        mensagem={`Tem certeza que deseja ${confirmarDialog.usuario?.status === STATUS_USUARIO.ATIVO ? 'inativar' : 'ativar'} o usuário "${confirmarDialog.usuario?.nome}"?`}
        tipo={confirmarDialog.usuario?.status === STATUS_USUARIO.ATIVO ? TIPOS_CONFIRMACAO.PERIGO : TIPOS_CONFIRMACAO.SUCESSO}
        onConfirmar={executarAlterarStatus}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar={confirmarDialog.usuario?.status === STATUS_USUARIO.ATIVO ? 'Inativar' : 'Ativar'}
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
};

export default UsuariosPage;
