/**
 * @file Página de Gerenciamento de Imagens
 * @description Interface completa de CRUD para imagens
 *
 * @module paginas/Imagens/ImagensPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaImage, FaSearch, FaCloudUploadAlt } from 'react-icons/fa';
import { FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import ImagensService from '../../servicos/imagens';
import TemasService from '../../servicos/temas';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/ImagensPage.css';

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
 * Página de Gerenciamento de Imagens
 *
 * Funcionalidades completas de CRUD.
 *
 * @component
 * @returns {JSX.Element}
 */
const ImagensPage = () => {
  // Autenticação e Permissões
  const { usuario, temPermissao } = useAuth();

  // Estado
  const [imagens, setImagens] = useState([]);
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
  const [totalImagens, setTotalImagens] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    imagem: null,
    carregando: false,
  });
  const [dragOver, setDragOver] = useState(false);

  // Carregar imagens ao montar o componente
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

      const resultado = await ImagensService.listar(pagina, itensPorPagina, filtros);

      if (resultado.sucesso) {
        setImagens(resultado.dados);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalImagens(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        //         _setErro(resultado.erro || 'Erro ao carregar imagens');
      }
    } catch (err) {
      //       _setErro('Erro inesperado ao carregar imagens');
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

  // Funções para upload de imagem
  const processarArquivoImagem = (arquivo) => {
    if (arquivo && arquivo.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, valor: event.target?.result || '' });
      };
      reader.readAsDataURL(arquivo);
    } else {
      setAlerta(criarAlerta('erro', 'Por favor, selecione uma imagem válida'));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processarArquivoImagem(files[0]);
    }
  };

  const limparImagem = (e) => {
    e.stopPropagation();
    setFormData({ ...formData, valor: '' });
  };

  const abrirModalCriar = () => {
    setEditando(null);
    setFormData(FORM_INICIAL);
    setErrosForm({});
    setModalAberto(true);
  };

  const abrirModalEditar = (imagem) => {
    setEditando(imagem.id);
    setFormData({
      temaId: imagem.temaId || '',
      categoria: imagem.categoria || '',
      nome: imagem.nome || '',
      valor: imagem.valor || '',
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

  const salvarImagem = async () => {
    const erros = validarFormulario(formData);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);

    try {
      const resultado = editando
        ? await ImagensService.atualizar(editando, formData)
        : await ImagensService.criar(formData);

      if (resultado.sucesso) {
        const msg = editando ? 'Imagem atualizada com sucesso!' : 'Imagem criada com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar imagem'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao salvar imagem'));
      console.error('[ERRO]', err);
    } finally {
      setSalvando(false);
    }
  };

  // =========================================================================
  // AÇÕES
  // =========================================================================

  const abrirConfirmarDelecao = (imagem) => {
    setConfirmarDialog({
      aberto: true,
      imagem,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      imagem: null,
      carregando: false,
    });
  };

  const executarDelecao = async () => {
    if (!confirmarDialog.imagem) return;

    setConfirmarDialog((prev) => ({ ...prev, carregando: true }));

    const imagem = confirmarDialog.imagem;

    try {
      const resultado = await ImagensService.deletar(imagem.id);

      if (resultado.sucesso) {
        setAlerta(criarAlerta('sucesso', 'Imagem deletada com sucesso!'));
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao deletar imagem'));
        setConfirmarDialog((prev) => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao deletar imagem'));
      console.error('[ERRO]', err);
      setConfirmarDialog((prev) => ({ ...prev, carregando: false }));
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="imagens-page">
      {/* Header */}
      <div className="imagens-header">
        <div className="imagens-header-content">
          <div>
            <h1>
              <FaImage /> Imagens
            </h1>
            <p>Gerenciar imagens do sistema</p>
          </div>
          {temPermissao('imagens_criar') && (
            <button className="imagens-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Nova Imagem
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`imagens-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <div>
        <input
          type="text"
          placeholder="Buscar imagem..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="imagens-filtro-input"
        />
      </div>

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={imagens}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhuma imagem encontrada"
        iconoVazio={<FaImage />}
        totalItens={totalImagens}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(imagem) => (
          <div className="grid-actions-group">
            {temPermissao('imagens_editar') && (
              <button
                onClick={() => abrirModalEditar(imagem)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('imagens_deletar') && (
              <button
                onClick={() => abrirConfirmarDelecao(imagem)}
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
        titulo={editando ? 'Editar Imagem' : 'Nova Imagem'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button className="modal-btn-salvar" onClick={salvarImagem} disabled={salvando}>
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
                placeholder="Ex: banner, logo, icone"
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
                placeholder="Ex: logo-principal, banner-home"
              />
              {errosForm.nome && <span className="modal-form-error">{errosForm.nome}</span>}
            </div>
          </div>

          {/* URL/Valor - full width com upload de imagem */}
          <div className="modal-form-row cols-1">
            <div className="modal-form-group">
              <label className="modal-form-label">
                Imagem <span className="required">*</span>
              </label>
              <div className="modal-form-file-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  className="modal-form-file"
                  id="imagem-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      processarArquivoImagem(file);
                    }
                  }}
                />
                <label
                  htmlFor="imagem-input"
                  className={`modal-form-file-label ${dragOver ? 'drag-over' : ''} ${formData.valor && formData.valor.startsWith('data:image') ? 'has-image' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {formData.valor && formData.valor.startsWith('data:image') ? (
                    <>
                      <img src={formData.valor} alt="Preview" className="modal-form-file-image" />
                      <div className="modal-form-file-actions">
                        <button
                          type="button"
                          className="modal-form-file-btn modal-form-file-btn-change"
                          title="Trocar imagem"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            document.getElementById('imagem-input').click();
                          }}
                        >
                          <FaCloudUploadAlt /> Trocar
                        </button>
                        <button
                          type="button"
                          className="modal-form-file-btn modal-form-file-btn-delete"
                          title="Excluir imagem"
                          onClick={limparImagem}
                        >
                          <FaTrash /> Excluir
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <FaCloudUploadAlt className="modal-form-file-icon" />
                      <div className="modal-form-file-content">
                        <span className="modal-form-file-title">
                          Clique para selecionar ou arraste uma imagem
                        </span>
                        <span className="modal-form-file-subtitle">PNG, JPG, GIF até 5MB</span>
                      </div>
                    </>
                  )}
                </label>
              </div>
              {errosForm.valor && <span className="modal-form-error">{errosForm.valor}</span>}
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        aberto={confirmarDialog.aberto}
        titulo="Deletar Imagem?"
        mensagem={`Tem certeza que deseja deletar a imagem "${confirmarDialog.imagem?.nome}"? Esta ação não pode ser desfeita.`}
        tipo={TIPOS_CONFIRMACAO.PERIGO}
        onConfirmar={executarDelecao}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar="Deletar"
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
};

export default ImagensPage;
