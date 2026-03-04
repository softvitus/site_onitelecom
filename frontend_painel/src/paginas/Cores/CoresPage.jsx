/**
 * @file Página de Gerenciamento de Cores
 * @description Interface completa de CRUD para cores
 * 
 * @module paginas/Cores/CoresPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaPalette, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import CoresService from '../../servicos/cores';
import TemasService from '../../servicos/temas';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/CoresPage.css';

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
  nome: '',
  valor: '#000000',
  categoria: '',
};

const COLUNAS_GRID = [
  { chave: 'nome', titulo: 'Nome', largura: '30%' },
  {
    chave: 'valor',
    titulo: 'Cor',
    largura: '20%',
    render: (valor) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: valor,
            border: '2px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <span style={{ fontSize: '0.85rem', color: '#666' }}>{valor}</span>
      </div>
    ),
  },
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

  if (!dados.nome?.trim()) {
    erros.nome = 'Nome é obrigatório';
  }

  if (!dados.valor?.trim()) {
    erros.valor = 'Cor é obrigatória';
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
 * Página de Gerenciamento de Cores
 * 
 * Funcionalidades completas de CRUD.
 * 
 * @component
 * @returns {JSX.Element}
 */
const CoresPage = () => {
  // Autenticação e Permissões
  const { temPermissao } = useAuth();
  
  // Estado
  const [cores, setCores] = useState([]);
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
  const [totalCores, setTotalCores] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    cor: null,
    carregando: false,
  });

  // Carregar cores ao montar o componente
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
      const resultado = await CoresService.listar(pagina, itensPorPagina, {
        search: filtro,
      });

      if (resultado.sucesso) {
        setCores(resultado.dados);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalCores(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        //         _setErro(resultado.erro || 'Erro ao carregar cores');
      }
    } catch (err) {
      //       _setErro('Erro inesperado ao carregar cores');
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

  const abrirModalEditar = (cor) => {
    setEditando(cor.id);
    setFormData({
      temaId: cor.temaId || '',
      nome: cor.nome || '',
      valor: cor.valor || '#000000',
      categoria: cor.categoria || '',
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

  const salvarCor = async () => {
    const erros = validarFormulario(formData);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);

    try {
      const resultado = editando
        ? await CoresService.atualizar(editando, formData)
        : await CoresService.criar(formData);

      if (resultado.sucesso) {
        const msg = editando ? 'Cor atualizada com sucesso!' : 'Cor criada com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar cor'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao salvar cor'));
      console.error('[ERRO]', err);
    } finally {
      setSalvando(false);
    }
  };

  // =========================================================================
  // AÇÕES
  // =========================================================================

  const abrirConfirmarDelecao = (cor) => {
    setConfirmarDialog({
      aberto: true,
      cor,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      cor: null,
      carregando: false,
    });
  };

  const executarDelecao = async () => {
    if (!confirmarDialog.cor) return;

    setConfirmarDialog(prev => ({ ...prev, carregando: true }));

    const cor = confirmarDialog.cor;

    try {
      const resultado = await CoresService.deletar(cor.id);

      if (resultado.sucesso) {
        setAlerta(criarAlerta('sucesso', 'Cor deletada com sucesso!'));
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao deletar cor'));
        setConfirmarDialog(prev => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao deletar cor'));
      console.error('[ERRO]', err);
      setConfirmarDialog(prev => ({ ...prev, carregando: false }));
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="cores-page">
      {/* Header */}
      <div className="cores-header">
        <div className="cores-header-content">
          <div>
            <h1>
              <FaPalette /> Cores
            </h1>
            <p>Gerenciar cores do sistema</p>
          </div>
          {temPermissao('cores_criar') && (
            <button className="cores-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Nova Cor
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`cores-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <div>
        <input
          type="text"
          placeholder="Buscar cor..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="cores-filtro-input"
        />
      </div>

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={cores}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhuma cor encontrada"
        iconoVazio={<FaPalette />}
        totalItens={totalCores}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(cor) => (
          <div className="grid-actions-group">
            {temPermissao('cores_editar') && (
              <button
                onClick={() => abrirModalEditar(cor)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('cores_deletar') && (
              <button
                onClick={() => abrirConfirmarDelecao(cor)}
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
        titulo={editando ? 'Editar Cor' : 'Nova Cor'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button
              className="modal-btn-salvar"
              onClick={salvarCor}
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

          {/* Nome e Cor */}
          <div className="modal-form-row cols-2">
            <div className="modal-form-group">
              <label className="modal-form-label">Nome <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Primária, Secundária, Acento"
              />
              {errosForm.nome && (
                <span className="modal-form-error">{errosForm.nome}</span>
              )}
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Cor <span className="required">*</span></label>
              <div className="modal-form-color-wrapper">
                <input
                  type="color"
                  className="modal-form-color-input"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                />
                <input
                  type="text"
                  className="modal-form-input modal-form-color-text"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="#000000"
                />
              </div>
              {errosForm.valor && (
                <span className="modal-form-error">{errosForm.valor}</span>
              )}
            </div>
          </div>

          {/* Categoria */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">Categoria <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                placeholder="Ex: principal, texto, fundo"
              />
              {errosForm.categoria && (
                <span className="modal-form-error">{errosForm.categoria}</span>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        aberto={confirmarDialog.aberto}
        titulo="Deletar Cor?"
        mensagem={`Tem certeza que deseja deletar a cor "${confirmarDialog.cor?.nome}"? Esta ação não pode ser desfeita.`}
        tipo={TIPOS_CONFIRMACAO.PERIGO}
        onConfirmar={executarDelecao}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar="Deletar"
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
};

export default CoresPage;
