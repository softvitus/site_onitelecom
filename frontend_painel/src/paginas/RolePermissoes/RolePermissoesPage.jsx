/**
 * @file Página de Gerenciamento de Role Permissões
 * @description Interface completa de CRUD para role permissões
 * 
 * @module paginas/RolePermissoes/RolePermissoesPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import RolePermissoesService from '../../servicos/rolePermissoes';
import PermissoesService from '../../servicos/permissoes';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/RolePermissoesPage.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const PAGINACAO = {
  PAGINA_INICIAL: 1,
  ITENS_POR_PAGINA: 10,
};

const DURACAO_ALERTA = 3000;

const FORM_INICIAL = {
  tipo: '',
  permissaoId: '',
};

const TIPOS_ROLE = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'usuario', label: 'Usuário' },
];

const COLUNAS_GRID = [
  {
    chave: 'tipo',
    titulo: 'Tipo de Role',
    largura: '25%',
    render: (valor) => {
      const tipo = TIPOS_ROLE.find(t => t.value === valor);
      return tipo?.label || valor;
    },
  },
  { chave: 'permissaoModulo', titulo: 'Módulo', largura: '25%' },
  { chave: 'permissaoAcao', titulo: 'Ação', largura: '25%' },
  { chave: 'permissaoDescricao', titulo: 'Descrição', largura: '25%' },
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

  if (!dados.tipo?.trim()) {
    erros.tipo = 'Tipo de role é obrigatório';
  }

  if (!dados.permissaoId?.trim()) {
    erros.permissaoId = 'Permissão é obrigatória';
  }

  return erros;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página de Gerenciamento de Role Permissões
 * 
 * Funcionalidades completas de CRUD para role permissões.
 * 
 * @component
 * @returns {JSX.Element}
 */
const RolePermissoesPage = () => {
  // Autenticação e Permissões
  const { temPermissao } = useAuth();

  // Estado
  const [rolePermissoes, setRolePermissoes] = useState([]);
  const [permissoes, setPermissoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoPermissoes, setCarregandoPermissoes] = useState(false);
  const [_erro, _setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Paginação
  const [totalRolePermissoes, setTotalRolePermissoes] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    rolePermissao: null,
    carregando: false,
  });

  // Carregar role permissões ao montar o componente
  useEffect(() => {
    carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
    carregarPermissoes();
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
      const resultado = await RolePermissoesService.listar(pagina, itensPorPagina, {
        search: filtro,
      });

      if (resultado.sucesso) {
        setRolePermissoes(resultado.dados);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalRolePermissoes(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        //         _setErro(resultado.erro || 'Erro ao carregar role permissões');
      }
    } catch (err) {
      //       _setErro('Erro inesperado ao carregar role permissões');
      console.error('[ERRO]', err);
    } finally {
      setCarregando(false);
    }
  };

  // Carregar permissões para o dropdown
  const carregarPermissoes = async () => {
    setCarregandoPermissoes(true);
    try {
      const resultado = await PermissoesService.listar(1, 100);
      if (resultado.sucesso) {
        setPermissoes(resultado.dados);
      }
    } catch (err) {
      console.error('[ERRO] ao carregar permissões', err);
    } finally {
      setCarregandoPermissoes(false);
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

  const abrirModalEditar = (rolePermissao) => {
    setEditando(rolePermissao.id);
    setFormData({
      tipo: rolePermissao.tipo || '',
      permissaoId: rolePermissao.permissaoId || '',
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

  const salvarRolePermissao = async () => {
    const erros = validarFormulario(formData);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);

    try {
      const resultado = editando
        ? await RolePermissoesService.atualizar(editando, formData)
        : await RolePermissoesService.criar(formData);

      if (resultado.sucesso) {
        const msg = editando ? 'Role permissão atualizada com sucesso!' : 'Role permissão criada com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar role permissão'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao salvar role permissão'));
      console.error('[ERRO]', err);
    } finally {
      setSalvando(false);
    }
  };

  // =========================================================================
  // AÇÕES
  // =========================================================================

  const abrirConfirmarDelecao = (rolePermissao) => {
    setConfirmarDialog({
      aberto: true,
      rolePermissao,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      rolePermissao: null,
      carregando: false,
    });
  };

  const executarDelecao = async () => {
    if (!confirmarDialog.rolePermissao) return;

    setConfirmarDialog(prev => ({ ...prev, carregando: true }));

    const rolePermissao = confirmarDialog.rolePermissao;

    try {
      const resultado = await RolePermissoesService.deletar(rolePermissao.id);

      if (resultado.sucesso) {
        setAlerta(criarAlerta('sucesso', 'Role permissão deletada com sucesso!'));
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao deletar role permissão'));
        setConfirmarDialog(prev => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao deletar role permissão'));
      console.error('[ERRO]', err);
      setConfirmarDialog(prev => ({ ...prev, carregando: false }));
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="role-permissoes-page">
      {/* Header */}
      <div className="role-permissoes-header">
        <div className="role-permissoes-header-content">
          <div>
            <h1>
              <FaShieldAlt /> Permissões de Funções
            </h1>
            <p>Gerenciar permissões por tipo de usuário (role)</p>
          </div>
          {temPermissao('role_permissoes_criar') && (
            <button className="role-permissoes-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Nova Permissão
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`role-permissoes-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <input
        type="text"
        placeholder="Buscar role permissão..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="role-permissoes-filtro-input"
      />

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={rolePermissoes}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhuma role permissão encontrada"
        iconoVazio={<FaShieldAlt />}
        totalItens={totalRolePermissoes}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(rolePermissao) => (
          <div className="grid-actions-group">
            {temPermissao('role_permissoes_editar') && (
              <button
                onClick={() => abrirModalEditar(rolePermissao)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('role_permissoes_deletar') && (
              <button
                onClick={() => abrirConfirmarDelecao(rolePermissao)}
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
        titulo={editando ? 'Editar Permissão de Função' : 'Nova Permissão de Função'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button
              className="modal-btn-salvar"
              onClick={salvarRolePermissao}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        }
      >
        <form className="modal-form">
          {/* Tipo - obrigatório */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">Tipo de Role <span className="required">*</span></label>
              <select
                className="modal-form-select"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value="">Selecione um tipo de role</option>
                {TIPOS_ROLE.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              {errosForm.tipo && (
                <span className="modal-form-error">{errosForm.tipo}</span>
              )}
            </div>
          </div>

          {/* Permissão - obrigatória */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">Permissão <span className="required">*</span></label>
              <select
                className="modal-form-select"
                value={formData.permissaoId}
                onChange={(e) => setFormData({ ...formData, permissaoId: e.target.value })}
                disabled={carregandoPermissoes}
              >
                <option value="">— Selecione uma permissão —</option>
                {permissoes.map((perm) => (
                  <option key={perm.id} value={perm.id}>
                    {perm.modulo} - {perm.acao}
                  </option>
                ))}
              </select>
              {errosForm.permissaoId && (
                <span className="modal-form-error">{errosForm.permissaoId}</span>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        aberto={confirmarDialog.aberto}
        titulo="Deletar Permissão de Função?"
        mensagem={`Tem certeza que deseja deletar esta permissão de função? Esta ação não pode ser desfeita.`}
        tipo={TIPOS_CONFIRMACAO.PERIGO}
        onConfirmar={executarDelecao}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar="Deletar"
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
};

export default RolePermissoesPage;
