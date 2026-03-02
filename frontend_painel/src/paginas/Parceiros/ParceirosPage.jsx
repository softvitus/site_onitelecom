/**
 * @file Página de Gerenciamento de Parceiros
 * @description Interface completa de CRUD para parceiros com mapa interativo
 * e integração com APIs de localização (ViaCEP e Nominatim)
 * 
 * @module paginas/Parceiros/ParceirosPage
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaToggleOn, FaBuilding, FaSearch } from 'react-icons/fa';
import { FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import ParceirosService from '../../servicos/parceiros';
import ViaCepService from '../../servicos/viacep';
import MapaParceiro from '../../componentes/personalizados/MapaParceiro';
import Grid from '../../componentes/Comum/Grid';
import Modal from '../../componentes/Comum/Modal';
import ConfirmDialog, { TIPOS_CONFIRMACAO } from '../../componentes/Comum/ConfirmDialog';
import '../../estilos/paginas/ParceirosPage.css';
import '../../estilos/componentes/personalizados/MapaParceiro.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const PAGINACAO = {
  PAGINA_INICIAL: 1,
  ITENS_POR_PAGINA: 10,
};

const DURACAO_ALERTA = 3000;
const RAIO_COBERTURA_PADRAO = 50;

const STATUS_PARCEIRO = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  SUSPENSO: 'suspenso',
};

const FORM_INICIAL = {
  nome: '',
  dominio: '',
  cidade: '',
  estado: '',
  endereco: '',
  cep: '',
  latitude: '',
  longitude: '',
  raioCobertura: RAIO_COBERTURA_PADRAO,
  status: STATUS_PARCEIRO.ATIVO,
};

const COLUNAS_GRID = [
  { chave: 'nome', titulo: 'Nome', largura: '25%' },
  { chave: 'dominio', titulo: 'Domínio', largura: '20%' },
  { chave: 'raioCobertura', titulo: 'Raio (km)', largura: '12%' },
  {
    chave: 'latitude',
    titulo: 'Latitude',
    largura: '12%',
    render: (valor) => parseFloat(valor)?.toFixed(4) || '—',
  },
  {
    chave: 'longitude',
    titulo: 'Longitude',
    largura: '12%',
    render: (valor) => parseFloat(valor)?.toFixed(4) || '—',
  },
  {
    chave: 'status',
    titulo: 'Status',
    largura: '10%',
    render: (valor) => (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '500',
        backgroundColor: valor === STATUS_PARCEIRO.ATIVO ? '#dcfce7' : '#fee2e2',
        color: valor === STATUS_PARCEIRO.ATIVO ? '#166534' : '#991b1b',
      }}>
        {valor === STATUS_PARCEIRO.ATIVO ? (
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

  if (!dados.dominio?.trim()) {
    erros.dominio = 'Domínio é obrigatório';
  }

  if (!dados.cidade?.trim()) {
    erros.cidade = 'Cidade é obrigatória';
  }

  return erros;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página de Gerenciamento de Parceiros
 * 
 * Funcionalidades completas de CRUD, mapa interativo e busca de CEP.
 * 
 * @component
 * @returns {JSX.Element}
 */
const ParceirosPage = () => {
  // Autenticação e Permissões
  const { temPermissao } = useAuth();
  
  // Estado
  const [parceiros, setParceiros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Paginação (gerenciada pelo Grid)
  const [totalParceiros, setTotalParceiros] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [confirmarDialog, setConfirmarDialog] = useState({
    aberto: false,
    parceiro: null,
    carregando: false,
  });

  // Carregar parceiros ao montar o componente
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
      const resultado = await ParceirosService.listar(pagina, itensPorPagina, {
        search: filtro,
      });

      if (resultado.sucesso) {
        setParceiros(resultado.dados);

        // Atualizar informações de paginação
        if (resultado.paginacao) {
          setTotalParceiros(resultado.paginacao.total);
          setTotalPaginas(resultado.paginacao.pages);
        }
      } else {
        setErro(resultado.erro || 'Erro ao carregar parceiros');
      }
    } catch (err) {
      setErro('Erro inesperado ao carregar parceiros');
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

  const abrirModalEditar = (parceiro) => {
    setEditando(parceiro.id);
    setFormData({
      nome: parceiro.nome || '',
      dominio: parceiro.dominio || '',
      cidade: parceiro.cidade || '',
      estado: parceiro.estado || '',
      endereco: parceiro.endereco || '',
      cep: parceiro.cep || '',
      latitude: parceiro.latitude || '',
      longitude: parceiro.longitude || '',
      raioCobertura: parceiro.raioCobertura || RAIO_COBERTURA_PADRAO,
      status: parceiro.status || STATUS_PARCEIRO.ATIVO,
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
  // LOCALIZAÇÃO
  // =========================================================================

  const pesquisarCep = async () => {
    if (!formData.cep.trim()) {
      setAlerta(criarAlerta('erro', 'Digite um CEP para pesquisar'));
      return;
    }

    setBuscandoCep(true);

    try {
      const resultado = await ViaCepService.buscarPorCep(formData.cep);

      if (resultado.sucesso) {
        const dadosAtualizados = {
          ...formData,
          cidade: resultado.dados.cidade,
          estado: resultado.dados.estado,
          endereco: resultado.dados.endereco || formData.endereco,
        };

        const coordenadas = await ViaCepService.buscarCoordenadas({
          endereco: resultado.dados.endereco,
          bairro: resultado.dados.bairro,
          cidade: resultado.dados.cidade,
          estado: resultado.dados.estado,
          cep: resultado.dados.cep,
        });

        dadosAtualizados.latitude = coordenadas.latitude;
        dadosAtualizados.longitude = coordenadas.longitude;

        setFormData(dadosAtualizados);
        setAlerta(
          criarAlerta(
            'sucesso',
            `CEP encontrado! Cidade: ${resultado.dados.cidade}, ${resultado.dados.estado}`
          )
        );
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'CEP não encontrado'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao pesquisar CEP'));
      console.error('[ERRO]', err);
    } finally {
      setBuscandoCep(false);
      setTimeout(() => setAlerta(null), DURACAO_ALERTA);
    }
  };

  // =========================================================================
  // SALVAR
  // =========================================================================

  const salvarParceiro = async () => {
    const erros = validarFormulario(formData);
    setErrosForm(erros);

    if (Object.keys(erros).length > 0) {
      setAlerta(criarAlerta('erro', 'Preencha os campos obrigatórios'));
      return;
    }

    setSalvando(true);

    try {
      const resultado = editando
        ? await ParceirosService.atualizar(editando, formData)
        : await ParceirosService.criar(formData);

      if (resultado.sucesso) {
        const msg = editando ? 'Parceiro atualizado com sucesso!' : 'Parceiro criado com sucesso!';
        setAlerta(criarAlerta('sucesso', msg));
        fecharModal();
        // Recarregar a primeira página
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao salvar parceiro'));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao salvar parceiro'));
      console.error('[ERRO]', err);
    } finally {
      setSalvando(false);
    }
  };

  // =========================================================================
  // AÇÕES
  // =========================================================================

  const abrirConfirmarAltararStatus = (parceiro) => {
    setConfirmarDialog({
      aberto: true,
      parceiro,
      carregando: false,
    });
  };

  const fecharConfirmarDialog = () => {
    setConfirmarDialog({
      aberto: false,
      parceiro: null,
      carregando: false,
    });
  };

  const executarAlterarStatus = async () => {
    if (!confirmarDialog.parceiro) return;

    setConfirmarDialog(prev => ({ ...prev, carregando: true }));

    const parceiro = confirmarDialog.parceiro;
    const novoStatus =
      parceiro.status === STATUS_PARCEIRO.ATIVO ? STATUS_PARCEIRO.INATIVO : STATUS_PARCEIRO.ATIVO;

    try {
      const resultado = await ParceirosService.atualizar(parceiro.id, {
        ...parceiro,
        status: novoStatus,
      });

      if (resultado.sucesso) {
        const alerta =
          novoStatus === STATUS_PARCEIRO.ATIVO
            ? 'Parceiro ativado com sucesso!'
            : 'Parceiro desativado com sucesso!';
        setAlerta(criarAlerta('sucesso', alerta));
        await carregarDadosGrid(PAGINACAO.PAGINA_INICIAL, PAGINACAO.ITENS_POR_PAGINA);
        setTimeout(() => setAlerta(null), DURACAO_ALERTA);
        fecharConfirmarDialog();
      } else {
        setAlerta(criarAlerta('erro', resultado.erro || 'Erro ao alterar status'));
        setConfirmarDialog(prev => ({ ...prev, carregando: false }));
      }
    } catch (err) {
      setAlerta(criarAlerta('erro', 'Erro ao alterar status do parceiro'));
      console.error('[ERRO]', err);
      setConfirmarDialog(prev => ({ ...prev, carregando: false }));
    }
  };

  const alternarStatusParceiro = (parceiro) => {
    abrirConfirmarAltararStatus(parceiro);
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="parceiros-page">
      {/* Header */}
      <div className="parceiros-header">
        <div className="parceiros-header-content">
          <div>
            <h1>
              <FaBuilding /> Parceiros
            </h1>
            <p>Gerenciar parceiros do sistema</p>
          </div>
          {temPermissao('parceiro_criar') && (
            <button className="parceiros-btn-criar" onClick={abrirModalCriar}>
              <FaPlus /> Novo Parceiro
            </button>
          )}
        </div>
      </div>

      {/* Alerta */}
      {alerta && <div className={`parceiros-alert ${alerta.tipo}`}>{alerta.mensagem}</div>}

      {/* Filtro */}
      <div>
        <input
          type="text"
          placeholder="Buscar parceiro..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="parceiros-filtro-input"
        />
      </div>

      {/* Grid com Paginação Integrada */}
      <Grid
        dados={parceiros}
        colunas={COLUNAS_GRID}
        carregando={carregando}
        mensagemVazia="Nenhum parceiro encontrado"
        iconoVazio={<FaBuilding />}
        totalItens={totalParceiros}
        totalPaginas={totalPaginas}
        onCarregarDados={carregarDadosGrid}
        itensPorPaginaInicial={PAGINACAO.ITENS_POR_PAGINA}
        renderAcoes={(parceiro) => (
          <div className="grid-actions-group">
            {temPermissao('parceiro_editar') && (
              <button
                onClick={() => abrirModalEditar(parceiro)}
                className="grid-btn-action grid-btn-action-edit"
                title="Editar"
              >
                <FaEdit />
              </button>
            )}
            {temPermissao('parceiro_editar') && (
              <button
                onClick={() => alternarStatusParceiro(parceiro)}
                className={`grid-btn-action ${parceiro.status === STATUS_PARCEIRO.ATIVO ? 'grid-btn-action-toggle-ativo' : 'grid-btn-action-toggle-inativo'}`}
                title={parceiro.status === STATUS_PARCEIRO.ATIVO ? 'Inativar' : 'Ativar'}
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
        titulo={editando ? 'Editar Parceiro' : 'Novo Parceiro'}
        tamanho="lg"
        footer={
          <div className="modal-footer">
            <button className="modal-btn-cancelar" onClick={fecharModal}>
              Cancelar
            </button>
            <button
              className="modal-btn-salvar"
              onClick={salvarParceiro}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        }
      >
        <form className="modal-form">
          {/* Linha 1 */}
          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">Nome <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do parceiro"
              />
              {errosForm.nome && (
                <span className="modal-form-error">{errosForm.nome}</span>
              )}
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Domínio <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.dominio}
                onChange={(e) => setFormData({ ...formData, dominio: e.target.value })}
                placeholder="parceiro.com.br"
              />
              {errosForm.dominio && (
                <span className="modal-form-error">{errosForm.dominio}</span>
              )}
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Cidade <span className="required">*</span></label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                placeholder="São Paulo"
              />
              {errosForm.cidade && (
                <span className="modal-form-error">{errosForm.cidade}</span>
              )}
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Estado (UF)</label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.estado}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estado: e.target.value.toUpperCase().slice(0, 2),
                  })
                }
                placeholder="SP"
                maxLength="2"
              />
            </div>
          </div>

          {/* Linha 2 - CEP e Endereço */}
          <div className="modal-form-row cols-2">
            <div className="modal-form-group">
              <label className="modal-form-label">CEP</label>
              <div className="parceiros-cep-input-group">
                <input
                  type="text"
                  className="modal-form-input"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="12345-678"
                />
                <button
                  type="button"
                  className="parceiros-btn-pesquisar-cep"
                  onClick={pesquisarCep}
                  disabled={buscandoCep}
                >
                  <FaSearch /> {buscandoCep ? 'Buscando...' : 'Pesquisar'}
                </button>
              </div>
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Endereço</label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Rua A, 123"
              />
            </div>
          </div>

          {/* Linha 3 */}
          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">Latitude</label>
              <input
                type="number"
                className="modal-form-input"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="-23.5505"
                step="0.0001"
                min="-90"
                max="90"
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Longitude</label>
              <input
                type="number"
                className="modal-form-input"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="-46.6333"
                step="0.0001"
                min="-180"
                max="180"
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Raio Cobertura (km)</label>
              <input
                type="number"
                className="modal-form-input"
                value={formData.raioCobertura}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    raioCobertura: parseFloat(e.target.value) || RAIO_COBERTURA_PADRAO,
                  })
                }
                placeholder={RAIO_COBERTURA_PADRAO.toString()}
                step="0.1"
                min="0"
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Status</label>
              <select
                className="modal-form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value={STATUS_PARCEIRO.ATIVO}>Ativo</option>
                <option value={STATUS_PARCEIRO.INATIVO}>Inativo</option>
                <option value={STATUS_PARCEIRO.SUSPENSO}>Suspenso</option>
              </select>
            </div>
          </div>

          {/* Mapa */}
          <div className="modal-form-group full-width parceiros-mapa-container">
            <label className="modal-form-label">Localização no Mapa</label>
            <MapaParceiro
              latitude={formData.latitude}
              longitude={formData.longitude}
              nomeParceiro={formData.nome || 'Novo Parceiro'}
              onMarkerDrag={(novasCoordenadas) => {
                setFormData({
                  ...formData,
                  latitude: novasCoordenadas.latitude,
                  longitude: novasCoordenadas.longitude,
                });
              }}
            />
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        aberto={confirmarDialog.aberto}
        titulo={confirmarDialog.parceiro?.status === STATUS_PARCEIRO.ATIVO ? 'Inativar Parceiro?' : 'Ativar Parceiro?'}
        mensagem={`Tem certeza que deseja ${confirmarDialog.parceiro?.status === STATUS_PARCEIRO.ATIVO ? 'inativar' : 'ativar'} o parceiro "${confirmarDialog.parceiro?.nome}"?`}
        tipo={confirmarDialog.parceiro?.status === STATUS_PARCEIRO.ATIVO ? TIPOS_CONFIRMACAO.PERIGO : TIPOS_CONFIRMACAO.SUCESSO}
        onConfirmar={executarAlterarStatus}
        onCancelar={fecharConfirmarDialog}
        textoBotaoConfirmar={confirmarDialog.parceiro?.status === STATUS_PARCEIRO.ATIVO ? 'Inativar' : 'Ativar'}
        carregando={confirmarDialog.carregando}
      />
    </div>
  );
};

export default ParceirosPage;
