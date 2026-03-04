/**
 * @file Página de Gerenciamento de Temas
 * @description Interface completa de CRUD para temas
 * 
 * @module paginas/Temas/TemasPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaPalette } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import TemasService from '../../servicos/temas';
import ParceirosService from '../../servicos/parceiros';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/TemasPage.css';

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
  parceiroId: '',
};

const COLUNAS_GRID = [
  { chave: 'nome', titulo: 'Nome', largura: '50%' },
  { chave: 'parceiroNome', titulo: 'Parceiro', largura: '30%' },
  { chave: 'criadoEm', titulo: 'Criado em', largura: '20%', render: (valor) => new Date(valor).toLocaleDateString('pt-BR') },
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

  if (!dados.parceiroId?.trim()) {
    erros.parceiroId = 'Parceiro é obrigatório';
  }

  return erros;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página de Gerenciamento de Temas
 * 
 * Funcionalidades completas de CRUD com listagem em grid.
 * 
 * @component
 * @returns {JSX.Element}
 */
const TemasPage = () => {
  // Autenticação e Permissões
  const { usuario, temPermissao } = useAuth();
  
  // Estado
  const [temas, setTemas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [_erro, _setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Paginação (gerenciada pelo Grid)
  const [totalTemas, setTotalTemas] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [parceiros, setParceiros] = useState([]);
  const [carregandoParceiros, setCarregandoParceiros] = useState(false);
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    tema: null,
    carregando: false,
  });

  // Carregar temas e parceiros ao montar o componente
  useEffect(() => {
    // Só carrega parceiros se tiver permissão
    if (temPermissao('parceiro_listar')) {
      carregarParceiros();
    }
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

  // Carregar dados para o Grid
  const carregarDadosGrid = async (pagina, itensPorPagina) => {
    setCarregando(true);
    //     _setErro(null);

    try {
      const filtros = {
        search: filtro,
      };

      // Se não é admin, filtra apenas seu parceiro
      if (usuario?.tipo !== 'admin' && usuario?.parceiroId) {
        filtros.parceiroId = usuario.parceiroId;
      }

      const resultado = await TemasService.listar(pagina, itensPorPagina, filtros);

      if (resultado.sucesso) {
        // Mapear temas para adicionar nome do parceiro
        const temasComParceiro = resultado.dados.map(tema => ({
          ...tema,
          parceiroNome: parceiros.find(p => p.id === tema.parceiroId)?.nome || 'N/A',
        }));
        setTemas(temasComParceiro);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalTemas(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        //         _setErro(resultado.erro || 'Erro ao carregar temas');
      }
    } catch (err) {
      //       _setErro('Erro inesperado ao carregar temas');
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

  const abrirModalEditar = (tema) => {
    setEditando(tema.id);
    setFormData({
      nome: tema.nome || '',
      parceiroId: tema.parceiroId || '',
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

  const salvarTema = async () => {
    const erros = validarFormulario(formData);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);

    try {
      const resultado = editando
        ? await TemasService.atualizar(editando, formData)
        : await TemasService.criar(formData);

      if (resultado.sucesso) {
        const msg = editando ? 'Tema atualizado com sucesso!' : 'Tema criado com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar tema'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao salvar tema'));
      console.error('[ERRO]', err);
    } finally {
      setSalvando(false);
    }
  };

  // =========================================================================
  // AÇÕES
  // =========================================================================

  const abrirConfirmarDelecao = (tema) => {
    setConfirmarDialog({
      aberto: true,
      tema,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      tema: null,
      carregando: false,
    });
  };

  const executarDelecao = async () => {
    if (!confirmarDialog.tema) return;

    setConfirmarDialog(prev => ({ ...prev, carregando: true }));

    try {
      const resultado = await TemasService.deletar(confirmarDialog.tema.id);

      if (resultado.sucesso) {
        setAlerta(criarAlerta('sucesso', 'Tema deletado com sucesso!'));
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao deletar tema'));
        setConfirmarDialog(prev => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao deletar tema'));
      console.error('[ERRO]', err);
      setConfirmarDialog(prev => ({ ...prev, carregando: false }));
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="temas-page">
      {/* Header */}
      <div className="temas-header">
        <div className="temas-header-content">
          <div>
            <h1>
              <FaPalette /> Temas
            </h1>
            <p>Gerenciar temas do sistema</p>
          </div>
          {temPermissao('tema_criar') && (
            <button className="temas-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Novo Tema
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`temas-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <div>
        <input
          type="text"
          placeholder="Buscar tema..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="temas-filtro-input"
        />
      </div>

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={temas}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhum tema encontrado"
        iconoVazio={<FaPalette />}
        totalItens={totalTemas}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(tema) => (
          <div className="grid-actions-group">
            {temPermissao('tema_editar') && (
              <button
                onClick={() => abrirModalEditar(tema)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('tema_deletar') && (
              <button
                onClick={() => abrirConfirmarDelecao(tema)}
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
        titulo={editando ? 'Editar Tema' : 'Novo Tema'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button
              className="modal-btn-salvar"
              onClick={salvarTema}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        }
      >
        <form className="modal-form">
          {/* Nome e Parceiro */}
          <div className="modal-form-row cols-2">
            <div className="modal-form-group">
              <label className="modal-form-label">Nome <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do tema"
              />
              {errosForm.nome && (
                <span className="modal-form-error">{errosForm.nome}</span>
              )}
            </div>

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
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        aberto={confirmarDialog.aberto}
        titulo="Deletar Tema?"
        mensagem={`Tem certeza que deseja deletar o tema "${confirmarDialog.tema?.nome}"? Esta ação não pode ser desfeita.`}
        tipo={TIPOS_CONFIRMACAO.PERIGO}
        onConfirmar={executarDelecao}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar="Deletar"
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
};

export default TemasPage;
