/**
 * @file Página de Gerenciamento de Permissões
 * @description Interface completa de CRUD para permissões
 *
 * @module paginas/Permissoes/PermissoesPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import PermissoesService from '../../servicos/permissoes';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/PermissoesPage.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const PAGINACAO = {
  PAGINA_INICIAL: 1,
  ITENS_POR_PAGINA: 10,
};

const DURACAO_ALERTA = 3000;

const MODULOS = [
  'usuarios',
  'parceiros',
  'temas',
  'paginas',
  'componentes',
  'elementos',
  'cores',
  'imagens',
  'links',
  'textos',
  'conteudo',
  'features',
  'config_tema',
  'auditoria',
  'permissoes',
  'role_permissoes',
];

const ACOES = ['criar', 'editar', 'deletar', 'listar', 'leituradados'];

const FORM_INICIAL = {
  modulo: '',
  acao: '',
  descricao: '',
};
const COLUNAS_GRID = [
  { chave: 'modulo', titulo: 'Módulo', largura: '25%' },
  { chave: 'acao', titulo: 'Ação', largura: '20%' },
  { chave: 'descricao', titulo: 'Descrição', largura: '55%' },
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

  if (!dados.modulo?.trim()) {
    erros.modulo = 'Módulo é obrigatório';
  }

  if (!dados.acao?.trim()) {
    erros.acao = 'Ação é obrigatória';
  }

  return erros;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página de Gerenciamento de Permissões
 *
 * Funcionalidades completas de CRUD para permissões.
 *
 * @component
 * @returns {JSX.Element}
 */
const PermissoesPage = () => {
  // Autenticação e Permissões
  const { temPermissao } = useAuth();

  // Estado
  const [permissoes, setPermissoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [_erro, _setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Paginação
  const [totalPermissoes, setTotalPermissoes] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    permissao: null,
    carregando: false,
  });

  // Carregar permissões ao montar o componente
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
      const resultado = await PermissoesService.listar(pagina, itensPorPagina, {
        search: filtro,
      });

      if (resultado.sucesso) {
        setPermissoes(resultado.dados);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalPermissoes(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        //         _setErro(resultado.erro || 'Erro ao carregar permissões');
      }
    } catch (err) {
      //       _setErro('Erro inesperado ao carregar permissões');
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

  const abrirModalEditar = (permissao) => {
    setEditando(permissao.id);
    setFormData({
      modulo: permissao.modulo || '',
      acao: permissao.acao || '',
      descricao: permissao.descricao || '',
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

  const salvarPermissao = async () => {
    console.log('[Permissões] Iniciando salvar com dados:', formData);

    const erros = validarFormulario(formData);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      console.log('[Permissões] Erros de validação:', erros);
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);
    console.log('[Permissões] Estado salvando definido como true');

    // Timeout de segurança: se a request não completar em 10 segundos, desativa o botão
    const timeoutId = setTimeout(() => {
      console.warn('[TIMEOUT] Requisição demorou mais de 10 segundos, desbloqueando botão');
      setSalvando(false);
      setAlerta(criarAlerta('erro', 'Requisição expirou. Tente novamente.'));
    }, 10000);

    try {
      console.log('[Permissões] Chamando service.criar com:', formData);
      const resultado = editando
        ? await PermissoesService.atualizar(editando, formData)
        : await PermissoesService.criar(formData);

      console.log('[Permissões] Resposta recebida:', resultado);

      if (resultado.sucesso) {
        const msg = editando
          ? 'Permissão atualizada com sucesso!'
          : 'Permissão criada com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        console.log('[Permissões] Erro ao salvar:', resultado.erro);
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar permissão'));
      }
    } catch (err) {
      console.error('[ERRO CATCH] PermissoesPage.salvarPermissao:', err);
      setAlerta(criarAlerta('erro', 'Erro ao salvar permissão'));
      console.error('[ERRO]', err);
    } finally {
      clearTimeout(timeoutId);
      console.log('[Permissões] Finalizando - setSalvando(false)');
      setSalvando(false);
    }
  };

  // =========================================================================
  // AÇÕES
  // =========================================================================

  const abrirConfirmarDeletar = (permissao) => {
    setConfirmarDialog({
      aberto: true,
      permissao,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      permissao: null,
      carregando: false,
    });
  };

  const executarDeletar = async () => {
    if (!confirmarDialog.permissao) return;

    setConfirmarDialog((prev) => ({ ...prev, carregando: true }));

    const permissao = confirmarDialog.permissao;

    try {
      const resultado = await PermissoesService.deletar(permissao.id);

      if (resultado.sucesso) {
        setAlerta(criarAlerta('sucesso', 'Permissão deletada com sucesso!'));
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao deletar permissão'));
        setConfirmarDialog((prev) => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao deletar permissão'));
      console.error('[ERRO]', err);
      setConfirmarDialog((prev) => ({ ...prev, carregando: false }));
    }
  };

  const deletarPermissao = (permissao) => {
    abrirConfirmarDeletar(permissao);
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="permissoes-page">
      {/* Header */}
      <div className="permissoes-header">
        <div className="permissoes-header-content">
          <div>
            <h1>
              <FaShieldAlt /> Permissões
            </h1>
            <p>Gerenciar permissões do sistema</p>
          </div>
          {/* Sempre mostrar botão para teste - remover verificação depois */}
          {temPermissao('permissoes_criar') && (
            <button className="permissoes-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Nova Permissão
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`permissoes-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <input
        type="text"
        placeholder="Buscar permissão..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="permissoes-filtro-input"
      />

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={permissoes}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhuma permissão encontrada"
        iconoVazio={<FaShieldAlt />}
        totalItens={totalPermissoes}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(permissao) => (
          <div className="grid-actions-group">
            {temPermissao('permissoes_editar') && (
              <button
                onClick={() => abrirModalEditar(permissao)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('permissoes_deletar') && (
              <button
                onClick={() => deletarPermissao(permissao)}
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
        titulo={editando ? 'Editar Permissão' : 'Nova Permissão'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button className="modal-btn-salvar" onClick={salvarPermissao} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        }
      >
        <form className="modal-form">
          {/* Linha 1: Módulo e Ação */}
          <div className="modal-form-row cols-2">
            <div className="modal-form-group">
              <label className="modal-form-label">
                Módulo <span className="required">*</span>
              </label>
              <select
                className="modal-form-select"
                value={formData.modulo}
                onChange={(e) => setFormData({ ...formData, modulo: e.target.value })}
              >
                <option value="">Selecione um módulo</option>
                {MODULOS.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
              {errosForm.modulo && <span className="modal-form-error">{errosForm.modulo}</span>}
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">
                Ação <span className="required">*</span>
              </label>
              <select
                className="modal-form-select"
                value={formData.acao}
                onChange={(e) => setFormData({ ...formData, acao: e.target.value })}
              >
                <option value="">Selecione uma ação</option>
                {ACOES.map((acao) => (
                  <option key={acao} value={acao}>
                    {acao}
                  </option>
                ))}
              </select>
              {errosForm.acao && <span className="modal-form-error">{errosForm.acao}</span>}
            </div>
          </div>

          {/* Linha 2: Descrição */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">Descrição</label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição da permissão (opcional)"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        aberto={confirmarDialog.aberto}
        titulo="Deletar Permissão?"
        mensagem={`Tem certeza que deseja deletar a permissão "${confirmarDialog.permissao?.modulo} - ${confirmarDialog.permissao?.acao}"?`}
        tipo={TIPOS_CONFIRMACAO.PERIGO}
        onConfirmar={executarDeletar}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar="Deletar"
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
};

export default PermissoesPage;
