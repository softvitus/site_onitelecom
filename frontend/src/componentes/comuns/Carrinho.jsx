/**
 * @fileoverview Componente Carrinho - Sistema completo de carrinho de compras
 * @component
 * @description
 * Sistema white-label de carrinho de compras com:
 * - Categorização de produtos (Planos, Internet, Telefonia, Entretenimento)
 * - Gerenciamento de itens (adicionar, remover, quantidade)
 * - Desconto combo Internet + Telefonia (10%)
 * - Exportação de orçamento (PDF e Excel)
 * - Modais de checkout e sucesso
 * - Notificações toast
 * @returns {React.ReactElement} Sistema de carrinho completo
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import styles from '../../estilos/componentes/comuns/Carrinho.module.css';
import {
  getTexto,
  getImagem,
  getTemaConteudosByCategoria,
  getTemaCoresGrouped,
  getCurrentParceiro,
} from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {number} Duração do toast em ms */
const TOAST_DURATION = 3000;

/** @constant {number} Percentual de desconto combo */
const COMBO_DISCOUNT_PERCENT = 0.1;

/** @constant {string[]} Categorias disponíveis */
const CATEGORIES = ['planos', 'internet', 'telefonia', 'entretenimento'];

/** @constant {Object} Ícones das categorias */
const CATEGORY_ICONS = {
  planos: 'bi-box',
  internet: 'bi-wifi',
  telefonia: 'bi-telephone',
  entretenimento: 'bi-film',
};

/** @constant {Object} Labels das categorias */
const CATEGORY_LABELS = {
  planos: 'Planos',
  internet: 'Internet',
  telefonia: 'Telefonia',
  entretenimento: 'Entretenimento',
};

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Converte cor HEX em RGB array para uso em jsPDF
 * @param {string} hex - Código de cor em hexadecimal (ex: '#8a1ce5')
 * @returns {number[]} Array RGB (ex: [138, 28, 229])
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [130, 28, 229];
};

/**
 * Obtém data formatada no padrão brasileiro
 * @returns {string} Data no formato DD/MM/YYYY HH:MM
 */
const getFormattedDate = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

/**
 * Formata valor monetário
 * @param {number} value - Valor a formatar
 * @returns {string} Valor formatado
 */
const formatCurrency = (value) => `R$ ${value.toFixed(2)}`;

/**
 * Obtém dados dos cards do tema
 * @returns {Object} Dados categorizados de produtos
 */
const getCardData = () => {
  const parseConteudo = (categoria) => {
    const conteudos = getTemaConteudosByCategoria(categoria);
    return conteudos.map((item) => {
      const dados = item.valor ? JSON.parse(item.valor) : {};
      return {
        id: dados.id || item.id,
        name: dados.name || dados.titulo || '',
        description: dados.description || dados.descricao || '',
        price: dados.price || 0,
        image: dados.image || '',
        badge: dados.badge || null,
      };
    });
  };

  return {
    planos: parseConteudo('carrinhoPlanos'),
    internet: parseConteudo('carrinhoInternet'),
    telefonia: parseConteudo('carrinhoTelefonia'),
    entretenimento: parseConteudo('carrinhoEntretenimento'),
  };
};

/**
 * Obtém nome da empresa do tema
 * @returns {string} Nome da empresa
 */
const getCompanyName = () => {
  const parceiro = getCurrentParceiro();
  return getTexto('company', 'name', parceiro?.nome || 'Empresa');
};

/**
 * Obtém ID do cliente do tema
 * @returns {string} ID do cliente
 */
const getClientId = () => {
  const parceiro = getCurrentParceiro();
  return parceiro?.id || 'cliente';
};

/**
 * Obtém URL do logo principal
 * @returns {string} URL do logo
 */
const getLogoUrl = () => getImagem('logos', 'main', '');

/**
 * Obtém cor primária do tema
 * @returns {string} Cor primária em hex
 */
const getPrimaryColor = () => {
  const cores = getTemaCoresGrouped();
  return cores?.primary?.main || '#8a1ce5';
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * CategoryTab - Aba de categoria de produtos
 * @param {Object} props - Props do componente
 * @param {string} props.category - Nome da categoria
 * @param {boolean} props.isActive - Se está ativa
 * @param {Function} props.onClick - Handler de clique
 * @returns {React.ReactElement}
 */
const CategoryTab = ({ category, isActive, onClick }) => (
  <li className="nav-item" role="presentation">
    <button
      className={`nav-link ${isActive ? 'active' : ''}`}
      onClick={onClick}
      aria-selected={isActive}
      role="tab"
    >
      <i
        className={`bi ${CATEGORY_ICONS[category]} ${styles['category-icon']}`}
        aria-hidden="true"
      />
      {CATEGORY_LABELS[category]}
    </button>
  </li>
);

/**
 * ProductCard - Card de produto individual
 * @param {Object} props - Props do componente
 * @param {Object} props.card - Dados do produto
 * @param {Function} props.onAddToCart - Handler de adicionar ao carrinho
 * @returns {React.ReactElement}
 */
const ProductCard = ({ card, onAddToCart }) => (
  <div className="col-md-6 col-lg-4 mb-4">
    <div className={styles['product-card']} role="article">
      <div
        className={styles['product-image']}
        style={{ backgroundImage: `url("${card.image}")` }}
        aria-hidden="true"
      />
      {card.badge && (
        <span className={styles['product-badge']} role="status">
          {card.badge}
        </span>
      )}
      <div className="card-body">
        <h5 className={styles['product-title']}>{card.name}</h5>
        <p className={styles['product-description']}>{card.description}</p>
        <p className={styles['product-price']}>
          {formatCurrency(card.price)}
          <small>/mês</small>
        </p>
        <button
          className={`btn ${styles['oni-gradient']} w-100`}
          onClick={() => onAddToCart(card.id, card.name, card.price)}
          aria-label={`Adicionar ${card.name} ao carrinho`}
        >
          <i className="bi bi-cart-plus" aria-hidden="true" /> Adicionar
        </button>
      </div>
    </div>
  </div>
);

/**
 * ProductGrid - Grid de produtos por categoria
 * @param {Object} props - Props do componente
 * @param {Object[]} props.products - Lista de produtos
 * @param {Function} props.onAddToCart - Handler de adicionar ao carrinho
 * @returns {React.ReactElement}
 */
const ProductGrid = ({ products, onAddToCart }) => (
  <div className="row" role="list" aria-label="Lista de produtos">
    {products.map((card) => (
      <ProductCard key={card.id} card={card} onAddToCart={onAddToCart} />
    ))}
  </div>
);

/**
 * CartItem - Item individual no carrinho
 * @param {Object} props - Props do componente
 * @param {string} props.id - ID do item
 * @param {Object} props.item - Dados do item
 * @param {Function} props.onIncrease - Handler aumentar quantidade
 * @param {Function} props.onDecrease - Handler diminuir quantidade
 * @param {Function} props.onRemove - Handler remover item
 * @returns {React.ReactElement}
 */
const CartItem = ({ id, item, onIncrease, onDecrease, onRemove }) => {
  const itemTotal = item.price * item.quantity;

  return (
    <div
      className={`${styles['cart-item']} p-2 mb-2 animate__animated animate__fadeIn`}
      role="listitem"
    >
      <div className="d-flex justify-content-between">
        <div>
          <h6 className="mb-0">{item.name}</h6>
          <small className="text-muted">{formatCurrency(item.price)}</small>
          <div className={styles['quantity-control']}>
            <button
              className={styles['quantity-btn']}
              onClick={() => onDecrease(id)}
              aria-label={`Diminuir quantidade de ${item.name}`}
            >
              -
            </button>
            <span className={styles['quantity-value']} aria-label="Quantidade">
              {item.quantity}
            </span>
            <button
              className={styles['quantity-btn']}
              onClick={() => onIncrease(id)}
              aria-label={`Aumentar quantidade de ${item.name}`}
            >
              +
            </button>
          </div>
        </div>
        <div className="d-flex align-items-center">
          <span className="me-2 fw-bold">{formatCurrency(itemTotal)}</span>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onRemove(id)}
            aria-label={`Remover ${item.name} do carrinho`}
          >
            <i className="bi bi-trash" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * EmptyCart - Estado vazio do carrinho
 * @returns {React.ReactElement}
 */
const EmptyCart = () => (
  <div className={styles['empty-cart']} role="status">
    <i className="bi bi-cart" aria-hidden="true" />
    <p>{getTexto('carrinho', 'vazio', 'Seu carrinho está vazio')}</p>
    <p className="text-muted">
      {getTexto('carrinho', 'vazioSubtexto', 'Adicione produtos para continuar')}
    </p>
  </div>
);

/**
 * DiscountBadge - Badge de desconto aplicado
 * @param {Object} props - Props do componente
 * @param {number} props.discount - Valor do desconto
 * @returns {React.ReactElement}
 */
const DiscountBadge = ({ discount }) => (
  <div className="alert alert-success mt-2 mb-2 animate__animated animate__fadeIn" role="status">
    <div className="d-flex justify-content-between">
      <span>
        <i className="bi bi-tag" aria-hidden="true" /> Desconto Combo (10%):
      </span>
      <span>-{formatCurrency(discount)}</span>
    </div>
  </div>
);

/**
 * CartSummary - Resumo do carrinho com total
 * @param {Object} props - Props do componente
 * @param {number} props.total - Total do carrinho
 * @param {number} props.itemsCount - Quantidade de itens
 * @returns {React.ReactElement}
 */
const CartSummary = ({ total, itemsCount }) => (
  <div className={styles['cart-total-section']}>
    <div className="d-flex justify-content-between">
      <h5>Total:</h5>
      <h5>{formatCurrency(total)}</h5>
    </div>
    <div className="d-flex justify-content-between text-muted small mb-2">
      <span>Itens:</span>
      <span>{itemsCount}</span>
    </div>
  </div>
);

/**
 * Toast - Notificação toast
 * @param {Object} props - Props do componente
 * @param {string} props.message - Mensagem do toast
 * @param {Function} props.onClose - Handler de fechar
 * @returns {React.ReactElement}
 */
const Toast = ({ message, onClose }) => (
  <div
    className={`position-fixed bottom-0 end-0 p-3 ${styles['toast-container']}`}
    style={{ zIndex: 11 }}
  >
    <div className={`toast show ${styles['toast']}`} role="alert" aria-live="polite">
      <div className={`toast-header ${styles['oni-gradient']}`}>
        <strong className="me-auto">{getCompanyName()}</strong>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onClose}
          aria-label="Fechar notificação"
        />
      </div>
      <div className="toast-body">{message}</div>
    </div>
  </div>
);

/**
 * CheckoutModal - Modal de confirmação de compra
 * @param {Object} props - Props do componente
 * @param {Object} props.cartItems - Itens do carrinho
 * @param {number} props.total - Total da compra
 * @param {number} props.discount - Desconto aplicado
 * @param {boolean} props.hasDiscount - Se tem desconto
 * @param {Function} props.onClose - Handler de fechar
 * @param {Function} props.onConfirm - Handler de confirmar
 * @returns {React.ReactElement}
 */
const CheckoutModal = ({ cartItems, total, discount, hasDiscount, onClose, onConfirm }) => (
  <div
    className="modal fade show"
    style={{ display: 'block' }}
    tabIndex="-1"
    role="dialog"
    aria-modal="true"
  >
    <div className="modal-dialog">
      <div className="modal-content">
        <div className={`modal-header ${styles['oni-gradient']}`}>
          <h5 className="modal-title">
            {getTexto('carrinho', 'finalizarTitulo', 'Finalizar Compra')}
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Fechar"
          />
        </div>
        <div className="modal-body">
          <p>
            {getTexto(
              'carrinho',
              'finalizarDescricao',
              'Você está prestes a finalizar sua compra com os seguintes itens:'
            )}
          </p>
          <div>
            {Object.keys(cartItems).map((id) => {
              const item = cartItems[id];
              const itemTotal = item.price * item.quantity;
              return (
                <div key={id} className="d-flex justify-content-between">
                  <span>
                    {item.name} ({item.quantity}x)
                  </span>
                  <span>{formatCurrency(itemTotal)}</span>
                </div>
              );
            })}
            {hasDiscount && (
              <div className="text-success d-flex justify-content-between">
                <span>
                  <i className="bi bi-tag" aria-hidden="true" /> Desconto Combo (10%):
                </span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>{formatCurrency(total)}</h5>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {getTexto('buttons', 'cancelar', 'Cancelar')}
          </button>
          <button type="button" className={`btn ${styles['oni-gradient']}`} onClick={onConfirm}>
            {getTexto('carrinho', 'confirmarCompra', 'Confirmar Compra')}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/**
 * SuccessModal - Modal de sucesso após compra
 * @param {Object} props - Props do componente
 * @param {Function} props.onClose - Handler de fechar
 * @returns {React.ReactElement}
 */
const SuccessModal = ({ onClose }) => (
  <div
    className="modal fade show"
    style={{ display: 'block' }}
    tabIndex="-1"
    role="dialog"
    aria-modal="true"
  >
    <div className="modal-dialog">
      <div className="modal-content">
        <div className={`modal-header ${styles['oni-gradient']}`}>
          <h5 className="modal-title">
            {getTexto('messages', 'success_compraRealizada', 'Compra Realizada!')}
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Fechar"
          />
        </div>
        <div className="modal-body text-center">
          <div className={styles['success-animation']}>
            <i
              className="bi bi-check-circle-fill animate__animated animate__bounceIn"
              aria-hidden="true"
            />
            <h4>{getTexto('messages', 'success_parabens', 'Parabéns!')}</h4>
            <p>
              {getTexto(
                'messages',
                'success_compraSucesso',
                'Sua compra foi realizada com sucesso.'
              )}
            </p>
            <p>
              {getTexto(
                'messages',
                'success_emailEnviado',
                'Em breve você receberá um e-mail com os detalhes.'
              )}
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className={`btn ${styles['oni-gradient']}`} onClick={onClose}>
            {getTexto('buttons', 'fechar', 'Fechar')}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/**
 * ModalBackdrop - Backdrop para modais
 * @param {Object} props - Props do componente
 * @param {Function} props.onClick - Handler de clique
 * @returns {React.ReactElement}
 */
const ModalBackdrop = ({ onClick }) => (
  <div className={styles['modal-backdrop']} onClick={onClick} aria-hidden="true" />
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente Carrinho - Sistema de carrinho de compras
 * @returns {React.ReactElement}
 */
const Carrinho = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────────

  const [cartItems, setCartItems] = useState({});
  const [activeTab, setActiveTab] = useState('planos');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const cardData = getCardData();

  // ─────────────────────────────────────────────────────────────────────────────────
  // HANDLERS - Gerenciamento do Carrinho
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Adiciona item ao carrinho
   * @param {string} id - ID do produto
   * @param {string} name - Nome do produto
   * @param {number} price - Preço do produto
   */
  const handleAddToCart = (id, name, price) => {
    setCartItems((prevItems) => {
      const newItems = JSON.parse(JSON.stringify(prevItems));

      if (newItems[id]) {
        newItems[id].quantity = newItems[id].quantity + 1;
        setToastMessage(`Quantidade de ${name} aumentada para ${newItems[id].quantity}!`);
      } else {
        newItems[id] = { name, price, quantity: 1 };
        setToastMessage(`${name} adicionado ao carrinho!`);
      }

      setShowToast(true);
      return newItems;
    });
  };

  /**
   * Remove item do carrinho
   * @param {string} id - ID do produto
   */
  const handleRemoveFromCart = (id) => {
    setCartItems((prevItems) => {
      const newItems = { ...prevItems };
      const name = newItems[id].name;
      delete newItems[id];
      setToastMessage(`${name} removido do carrinho!`);
      setShowToast(true);
      return newItems;
    });
  };

  /**
   * Aumenta quantidade de um item
   * @param {string} id - ID do produto
   */
  const handleIncreaseQuantity = (id) => {
    setCartItems((prevItems) => {
      const newItems = JSON.parse(JSON.stringify(prevItems));
      newItems[id].quantity = newItems[id].quantity + 1;
      return newItems;
    });
  };

  /**
   * Diminui quantidade de um item
   * @param {string} id - ID do produto
   */
  const handleDecreaseQuantity = (id) => {
    setCartItems((prevItems) => {
      const newItems = JSON.parse(JSON.stringify(prevItems));
      if (newItems[id].quantity > 1) {
        newItems[id].quantity = newItems[id].quantity - 1;
      } else {
        delete newItems[id];
      }
      return newItems;
    });
  };

  /**
   * Limpa todos os itens do carrinho
   */
  const handleClearCart = () => {
    setCartItems({});
    setToastMessage('Carrinho limpo!');
    setShowToast(true);
  };

  /**
   * Fecha toast de notificação
   */
  const handleCloseToast = () => setShowToast(false);

  /**
   * Abre modal de checkout
   */
  const handleOpenCheckout = () => setShowCheckoutModal(true);

  /**
   * Fecha modal de checkout
   */
  const handleCloseCheckout = () => setShowCheckoutModal(false);

  /**
   * Fecha modal de sucesso
   */
  const handleCloseSuccess = () => setShowSuccessModal(false);

  /**
   * Confirma compra
   */
  const handleConfirmPurchase = () => {
    setShowCheckoutModal(false);
    setTimeout(() => {
      setCartItems({});
      setShowSuccessModal(true);
    }, 500);
  };

  /**
   * Fecha qualquer modal aberto
   */
  const handleCloseModals = () => {
    setShowCheckoutModal(false);
    setShowSuccessModal(false);
  };

  /**
   * Muda aba ativa
   * @param {string} tab - Nome da aba
   */
  const handleTabChange = (tab) => setActiveTab(tab);

  // ─────────────────────────────────────────────────────────────────────────────────
  // FUNÇÕES DE CÁLCULO
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Prepara dados do pedido para exportação
   * @returns {Object} Dados formatados do pedido
   */
  const prepareOrderData = () => {
    const orderData = [];
    let subtotal = 0;
    let hasInternet = false;
    let hasTelefonia = false;

    for (const id in cartItems) {
      if (id.startsWith('internet')) hasInternet = true;
      if (id.startsWith('tel')) hasTelefonia = true;

      const item = cartItems[id];
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      orderData.push({
        produto: item.name,
        quantidade: item.quantity,
        precoUnitario: formatCurrency(item.price),
        total: formatCurrency(itemTotal),
      });
    }

    const hasDiscount = hasInternet && hasTelefonia;
    const discount = hasDiscount ? subtotal * COMBO_DISCOUNT_PERCENT : 0;
    const total = subtotal - discount;

    return { items: orderData, subtotal, discount, total, hasDiscount };
  };

  /**
   * Calcula total do carrinho com descontos
   * @returns {Object} {subtotal, discount, total, itemsCount, hasDiscount}
   */
  const calculateTotal = () => {
    let total = 0;
    let itemsCount = 0;
    let hasInternet = false;
    let hasTelefonia = false;

    for (const id in cartItems) {
      if (id.startsWith('internet')) hasInternet = true;
      if (id.startsWith('tel')) hasTelefonia = true;

      const item = cartItems[id];
      itemsCount += item.quantity;
      total += item.price * item.quantity;
    }

    const hasDiscount = hasInternet && hasTelefonia;
    const discount = hasDiscount ? total * COMBO_DISCOUNT_PERCENT : 0;
    const finalTotal = total - discount;

    return {
      subtotal: total,
      discount,
      total: finalTotal,
      itemsCount,
      hasDiscount,
    };
  };

  // ─────────────────────────────────────────────────────────────────────────────────
  // HANDLERS - Exportação
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Exporta orçamento para PDF
   */
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const orderData = prepareOrderData();
    const formattedDate = getFormattedDate();
    const logoUrl = getLogoUrl();

    function addLogoAndContinue(logoImg) {
      if (logoImg) {
        doc.addImage(logoImg, 'PNG', 15, 10, 40, 20);
      }

      doc.setFontSize(20);
      doc.text('Orçamento', 105, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`Data: ${formattedDate}`, 105, 30, { align: 'center' });
      doc.text(
        'Este documento é apenas um orçamento e não representa uma compra finalizada.',
        105,
        35,
        { align: 'center' }
      );

      doc.setFontSize(12);
      doc.text('Produtos Selecionados:', 14, 45);

      const tableColumn = ['Produto', 'Quantidade', 'Preço Unitário', 'Total'];
      const tableRows = orderData.items.map((item) => [
        item.produto,
        item.quantidade,
        item.precoUnitario,
        item.total,
      ]);

      import('jspdf-autotable').then((autoTableModule) => {
        const autoTable = autoTableModule.default;
        let startY = 50;

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: hexToRgb(getPrimaryColor()) },
          didDrawPage: (data) => {
            startY = data.cursor.y;
          },
        });

        startY += 10;
        doc.text('Resumo do Pedido:', 14, startY);
        doc.text(`Subtotal: ${formatCurrency(orderData.subtotal)}`, 14, startY + 7);

        if (orderData.hasDiscount) {
          doc.text(
            `Desconto (10% Combo Internet + Telefonia): -${formatCurrency(orderData.discount)}`,
            14,
            startY + 14
          );
          doc.text(`Total: ${formatCurrency(orderData.total)}`, 14, startY + 21);
        } else {
          doc.text(`Total: ${formatCurrency(orderData.total)}`, 14, startY + 14);
        }

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(
            `${getCompanyName()} - Entre em contato conosco para finalizar seu pedido`,
            105,
            287,
            { align: 'center' }
          );
        }

        doc.save(`${getClientId()}_Orcamento.pdf`);
        setToastMessage('Orçamento exportado como PDF!');
        setShowToast(true);
      });
    }

    const logoImg = new Image();
    logoImg.crossOrigin = 'Anonymous';
    logoImg.onload = () => addLogoAndContinue(logoImg);
    logoImg.onerror = () => addLogoAndContinue(null);
    logoImg.src = logoUrl;
  };

  /**
   * Exporta orçamento para Excel
   */
  const handleExportExcel = () => {
    const orderData = prepareOrderData();
    const formattedDate = getFormattedDate();
    const companyName = getCompanyName();

    const wb = XLSX.utils.book_new();
    const productData = [
      [`${companyName} - Orçamento`, '', '', ''],
      [`Data: ${formattedDate}`, '', '', ''],
      ['Este documento é apenas um orçamento e não representa uma compra finalizada.', '', '', ''],
      ['', '', '', ''],
      ['Produtos Selecionados:', '', '', ''],
      ['Produto', 'Quantidade', 'Preço Unitário', 'Total'],
    ];

    orderData.items.forEach((item) => {
      productData.push([item.produto, item.quantidade, item.precoUnitario, item.total]);
    });

    productData.push(['', '', '', '']);
    productData.push(['Resumo do Pedido:', '', '', '']);
    productData.push(['Subtotal:', '', '', formatCurrency(orderData.subtotal)]);

    if (orderData.hasDiscount) {
      productData.push([
        'Desconto (10% Combo Internet + Telefonia):',
        '',
        '',
        `-${formatCurrency(orderData.discount)}`,
      ]);
    }

    productData.push(['Total:', '', '', formatCurrency(orderData.total)]);
    productData.push(['', '', '', '']);
    productData.push([
      `${companyName} - Entre em contato conosco para finalizar seu pedido`,
      '',
      '',
      '',
    ]);

    const ws = XLSX.utils.aoa_to_sheet(productData);
    ws['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Orçamento');
    XLSX.writeFile(wb, `${getClientId()}_Orcamento.xlsx`);

    setToastMessage('Orçamento exportado como Excel!');
    setShowToast(true);
  };

  // ─────────────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), TOAST_DURATION);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // ─────────────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────────────

  const { subtotal, discount, total, itemsCount, hasDiscount } = calculateTotal();
  const hasItems = Object.keys(cartItems).length > 0;

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <div className="container py-4" aria-labelledby="carrinho-title">
      {/* Título do Carrinho */}
      <div className="row mb-4">
        <div className="col-12 text-center">
          <h2
            id="carrinho-title"
            className={`animate__animated animate__fadeInDown ${styles['title']}`}
          >
            <i className="bi bi-cart3" aria-hidden="true" /> Carrinho {getCompanyName()}
          </h2>
          <p className="text-muted animate__animated animate__fadeIn">
            Escolha seus produtos e monte seu pacote ideal
          </p>
          <hr />
        </div>
      </div>

      <div className="row">
        {/* Produtos Disponíveis */}
        <div className="col-lg-8">
          <h4 className="mb-4">
            <i className="bi bi-bag-plus" aria-hidden="true" /> Adicione produtos ao seu carrinho
          </h4>

          {/* Categorias em abas */}
          <ul className="nav nav-tabs mb-3" role="tablist" aria-label="Categorias de produtos">
            {CATEGORIES.map((category) => (
              <CategoryTab
                key={category}
                category={category}
                isActive={activeTab === category}
                onClick={() => handleTabChange(category)}
              />
            ))}
          </ul>

          {/* Conteúdo das abas */}
          <div className="tab-content" role="tabpanel">
            {cardData[activeTab] && (
              <ProductGrid products={cardData[activeTab]} onAddToCart={handleAddToCart} />
            )}
          </div>
        </div>

        {/* Carrinho */}
        <div className="col-lg-4">
          <div className={`card ${styles['cart-container']}`}>
            <div className={`card-header ${styles['oni-gradient']} ${styles['cart-header']}`}>
              <h5 className="mb-0">
                <i className="bi bi-cart3" aria-hidden="true" />{' '}
                {getTexto('carrinho', 'title', 'Seu Carrinho')}
              </h5>
            </div>
            <div className="card-body">
              <div id="cart-items" role="list" aria-label="Itens no carrinho">
                {!hasItems ? (
                  <EmptyCart />
                ) : (
                  <>
                    {Object.keys(cartItems).map((id) => (
                      <CartItem
                        key={id}
                        id={id}
                        item={cartItems[id]}
                        onIncrease={handleIncreaseQuantity}
                        onDecrease={handleDecreaseQuantity}
                        onRemove={handleRemoveFromCart}
                      />
                    ))}
                    {hasDiscount && <DiscountBadge discount={discount} />}
                  </>
                )}
              </div>

              <CartSummary total={total} itemsCount={itemsCount} />

              <button
                className={`btn ${styles['oni-gradient']} w-100 mt-3`}
                disabled={!hasItems}
                onClick={handleOpenCheckout}
                aria-label="Finalizar compra"
              >
                <i className="bi bi-credit-card" aria-hidden="true" />{' '}
                {getTexto('carrinho', 'finalizar', 'Finalizar Pedido')}
              </button>

              <div className="text-center mt-3">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={!hasItems}
                  onClick={handleClearCart}
                  aria-label="Limpar carrinho"
                >
                  <i className="bi bi-trash" aria-hidden="true" /> Limpar Carrinho
                </button>
              </div>

              <div className="text-center mt-3">
                <div className="btn-group" role="group" aria-label="Exportar orçamento">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    disabled={!hasItems}
                    onClick={handleExportPDF}
                    aria-label="Exportar para PDF"
                  >
                    <i className="bi bi-file-pdf" aria-hidden="true" /> Exportar PDF
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    disabled={!hasItems}
                    onClick={handleExportExcel}
                    aria-label="Exportar para Excel"
                  >
                    <i className="bi bi-file-excel" aria-hidden="true" /> Exportar Excel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sugestões */}
          <div className="card mt-4">
            <div className={`card-header ${styles['oni-gradient']}`}>
              <h5 className="mb-0">
                <i className="bi bi-lightbulb" aria-hidden="true" /> Recomendações
              </h5>
            </div>
            <div className="card-body">
              <p>Combine nossos produtos e economize!</p>
              <div className="alert alert-info" role="note">
                <i className="bi bi-info-circle" aria-hidden="true" />
                Ao adicionar Internet + Telefonia, você ganha 10% de desconto!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      {showCheckoutModal && (
        <CheckoutModal
          cartItems={cartItems}
          total={total}
          discount={discount}
          hasDiscount={hasDiscount}
          onClose={handleCloseCheckout}
          onConfirm={handleConfirmPurchase}
        />
      )}

      {showSuccessModal && <SuccessModal onClose={handleCloseSuccess} />}

      {/* Toast */}
      {showToast && <Toast message={toastMessage} onClose={handleCloseToast} />}

      {/* Backdrop */}
      {(showCheckoutModal || showSuccessModal) && <ModalBackdrop onClick={handleCloseModals} />}
    </div>
  );
};

export default Carrinho;
