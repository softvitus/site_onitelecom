/**
 * @file Componente Grid Profissional e Minimalista
 * @description Grid com paginação integrada, design moderno e elegante.
 * Reutilizável em múltiplas páginas com styling profissional.
 *
 * @module componentes/Comum/Grid
 */

import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../../estilos/componentes/Comum/Grid.css';

// ============================================================================
// CONSTANTES
// ============================================================================

const OPCOES_ITENS_POR_PAGINA = [5, 10, 25, 50, 100];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Grid = ({
  dados = [],
  colunas = [],
  carregando = false,
  onCarregarDados = () => {},
  mensagemVazia = 'Nenhum item encontrado',
  iconoVazio = null,
  totalItens = 0,
  totalPaginas = 0,
  renderAcoes = () => null,
  itensPorPaginaInicial = 10,
}) => {
  // Estado de paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(itensPorPaginaInicial);

  // Carregar dados quando página ou itens mudam
  useEffect(() => {
    onCarregarDados(paginaAtual, itensPorPagina);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaAtual, itensPorPagina]);

  // Controles de paginação
  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const irParaPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaAtual(pagina);
    }
  };

  const handleAlterarItensPorPagina = (novoValor) => {
    setItensPorPagina(novoValor);
    setPaginaAtual(1);
  };

  // Renderizar números das páginas
  const renderBotoesNumeros = () => {
    const botoes = [];
    const totalMostrado = Math.min(5, totalPaginas);
    let inicio = 1;

    if (totalPaginas > 5) {
      if (paginaAtual <= 3) {
        inicio = 1;
      } else if (paginaAtual >= totalPaginas - 2) {
        inicio = totalPaginas - 4;
      } else {
        inicio = paginaAtual - 2;
      }
    }

    for (let i = 0; i < totalMostrado; i++) {
      const pagina = inicio + i;
      const isAtiva = pagina === paginaAtual;

      botoes.push(
        <button
          key={pagina}
          onClick={() => irParaPagina(pagina)}
          className={`grid-page-number ${isAtiva ? 'active' : ''}`}
        >
          {pagina}
        </button>
      );
    }

    return botoes;
  };

  // Renderizar célula
  const renderCelula = (item, coluna) => {
    if (coluna.render) {
      return coluna.render(item[coluna.chave], item);
    }
    return item[coluna.chave] || '—';
  };

  // Calcular intervalo
  const inicio = (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, totalItens);

  return (
    <div className="grid-container">
      {/* Estado Carregando */}
      {carregando && (
        <div className="grid-loading-container">
          <div className="grid-spinner" />
        </div>
      )}

      {/* Estado Vazio */}
      {!carregando && dados.length === 0 && (
        <div className="grid-empty-container">
          {iconoVazio && <div className="grid-empty-icon">{iconoVazio}</div>}
          <h3 className="grid-empty-title">{mensagemVazia}</h3>
        </div>
      )}

      {/* Dados */}
      {!carregando && dados.length > 0 && (
        <div className="grid-wrapper">
          {/* Tabela */}
          <table className="grid-table">
            <thead>
              <tr>
                {colunas.map((coluna) => (
                  <th key={coluna.chave} style={{ width: coluna.largura }}>
                    {coluna.titulo}
                  </th>
                ))}
                {renderAcoes && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {dados.map((item, idx) => (
                <tr key={item.id || idx}>
                  {colunas.map((coluna) => (
                    <td key={`${item.id || idx}-${coluna.chave}`}>{renderCelula(item, coluna)}</td>
                  ))}
                  {renderAcoes && <td className="grid-acoes">{renderAcoes(item)}</td>}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer com Paginação */}
          {totalPaginas >= 1 && (
            <div className="grid-footer">
              <div className="grid-pagination-info">
                Mostrando <strong>{inicio}</strong> a <strong>{fim}</strong> de{' '}
                <strong>{totalItens}</strong> resultado{totalItens !== 1 ? 's' : ''}
              </div>

              <select
                value={itensPorPagina}
                onChange={(e) => handleAlterarItensPorPagina(parseInt(e.target.value))}
                className="grid-items-per-page"
              >
                {OPCOES_ITENS_POR_PAGINA.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao} por página
                  </option>
                ))}
              </select>

              <div className="grid-nav-buttons">
                <button
                  onClick={paginaAnterior}
                  disabled={paginaAtual === 1}
                  className="grid-pagination-button"
                >
                  <FaChevronLeft size={12} />
                  Anterior
                </button>

                <div style={{ display: 'flex', gap: '0.25rem' }}>{renderBotoesNumeros()}</div>

                <button
                  onClick={proximaPagina}
                  disabled={paginaAtual === totalPaginas}
                  className="grid-pagination-button"
                >
                  Próxima
                  <FaChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Grid;
