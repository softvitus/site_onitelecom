/**
 * @fileoverview Componente Contato - Seção de contato completa com formulário e mapa
 * @component
 * @description
 * Renderiza seção de contato completa com:
 * - Canais de contato (WhatsApp, Telefone, Email, Endereço)
 * - Formulário de contato com validação e feedback visual
 * - Mapa Leaflet interativo com localizações de parceiros
 * - Geolocalização automática de parceiros
 * - Suporte completo a acessibilidade
 * @returns {React.ReactElement} Seção de contato completa
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import {
  faPhoneAlt,
  faCheckCircle,
  faExclamationCircle,
  faSpinner,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../../estilos/componentes/comuns/Contato.module.css';
import { getTemaPaginas, getTexto, getLink } from '../../servicos/tema';
import { buscarTodosParceiros } from '../../servicos/parceiro';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {number} Limite de parceiros a buscar */
const PARCEIROS_LIMIT = 100;

/** @constant {number} Delay para simular envio (ms) */
const SUBMIT_DELAY = 1500;

/** @constant {number} Delay para remover mensagem (ms) */
const MESSAGE_TIMEOUT = 5000;

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Verifica se um elemento está habilitado no contato da API
 * @param {string} elementName - Nome do elemento a verificar
 * @returns {boolean} true se elemento está habilitado
 */
const isElementEnabled = (elementName) => {
  try {
    const paginas = getTemaPaginas();
    if (!paginas?.length) return false;

    const paginaInicio = paginas.find((p) => p.nome === 'inicio');
    if (!paginaInicio?.componentes) return false;

    const componenteContato = paginaInicio.componentes.find((c) => c.nome === 'contato');
    if (!componenteContato?.elementos) return false;

    return componenteContato.elementos.some(
      (el) =>
        el.nome === elementName && el.habilitado === true && el.habilitadoNoComponente === true
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    // eslint-disable-next-line no-console

    console.error(`Erro ao verificar elemento '${elementName}':`, error);
    return false;
  }
};

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} true se email é válido
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * ContatoHeader - Título principal
 * @returns {React.ReactElement}
 */
const ContatoHeader = () => (
  <div className={styles.titulo} role="heading" aria-level="2">
    {getTexto('contato', 'title', 'Contato')}
  </div>
);

/**
 * ContactCard - Card individual de contact info
 * @returns {React.ReactElement}
 */
const ContactCard = ({ label, value, icon, href, ariaLabel }) => (
  <div className={styles['caixa-contato']}>
    <span>{label}</span>
    <div className={styles['numero-contato']}>
      <FontAwesomeIcon icon={icon} className={styles.icon} aria-hidden="true" />
      <a href={href} aria-label={ariaLabel} title={ariaLabel}>
        <strong>{value}</strong>
      </a>
    </div>
  </div>
);

/**
 * PhonesSection - Seção de telefones
 * @returns {React.ReactElement}
 */
const PhonesSection = () =>
  isElementEnabled('phones') && (
    <div className={styles['caixas-contato']}>
      <ContactCard
        label={getTexto('contato', 'whatsapp_label', 'WhatsApp')}
        value={getLink('telefone', 'WhatsApp Formatted', '')}
        icon={faWhatsapp}
        href={getLink('social', 'WhatsApp', '#')}
        ariaLabel={`WhatsApp: ${getLink('telefone', 'WhatsApp Formatted', '')}`}
      />
      <ContactCard
        label={getTexto('contato', 'phone_label', 'Telefone')}
        value={getLink('telefone', 'Support Formatted', '')}
        icon={faPhoneAlt}
        href={`tel:${getLink('telefone', 'Support', '')}`}
        ariaLabel={`Telefone: ${getLink('telefone', 'Support Formatted', '')}`}
      />
    </div>
  );

/**
 * EmailSection - Seção de email
 * @returns {React.ReactElement}
 */
const EmailSection = () => {
  const email = getTexto('contato', 'email', 'contato@oni.com.br');
  return (
    isElementEnabled('email') && (
      <div className={styles['caixa-contato']}>
        <span>{getTexto('contato', 'email_label', 'Email')}</span>
        <div className={styles['numero-contato']}>
          <a href={`mailto:${email}`} aria-label={`Email: ${email}`} title={email}>
            <strong>{email}</strong>
          </a>
        </div>
      </div>
    )
  );
};

/**
 * AddressSection - Seção de endereço
 * @returns {React.ReactElement}
 */
const AddressSection = () => {
  const address = getTexto('contato', 'address', 'Endereço da empresa');
  return (
    isElementEnabled('address') && (
      <div className={styles['caixa-contato']}>
        <span>{getTexto('contato', 'address_label', 'Endereço')}</span>
        <div className={styles['numero-contato']}>
          <p>{address}</p>
        </div>
      </div>
    )
  );
};

/**
 * AllContactCards - Container com todos os cards de contato
 * @returns {React.ReactElement}
 */
const AllContactCards = () => (
  <div className={styles['caixas-contato-todas']}>
    <PhonesSection />
    <EmailSection />
    <AddressSection />
  </div>
);

/**
 * FormMessage - Mensagem de feedback do formulário
 * @returns {React.ReactElement}
 */
const FormMessage = ({ type, text }) =>
  !type ? null : (
    <div className={`${styles['form-message']} ${styles[`${type}-message`]}`} role="alert">
      {type === 'loading' && (
        <FontAwesomeIcon
          icon={faSpinner}
          className={`${styles['message-icon']} fa-spin`}
          aria-hidden="true"
        />
      )}
      {type === 'success' && (
        <FontAwesomeIcon
          icon={faCheckCircle}
          className={styles['message-icon']}
          aria-hidden="true"
        />
      )}
      {type === 'error' && (
        <FontAwesomeIcon
          icon={faExclamationCircle}
          className={styles['message-icon']}
          aria-hidden="true"
        />
      )}
      <span>{text}</span>
    </div>
  );

/**
 * FormSection - Formulário de contato
 * @returns {React.ReactElement}
 */
const FormSection = ({ formData, formMessage, isLoading, onInputChange, onSubmit, onReset }) =>
  isElementEnabled('form') && (
    <div className={styles['form-section']}>
      <h3>{getTexto('contato', 'form_title', 'Fale Conosco')}</h3>

      <form onSubmit={onSubmit} aria-label="Formulário de contato">
        {/* Nome */}
        <div className={styles['form-group']}>
          <label htmlFor="form-name">{getTexto('contato', 'form_name', 'Seu Nome')} *</label>
          <input
            id="form-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder="João Silva"
            aria-label="Nome completo"
            required
            disabled={isLoading}
          />
        </div>

        {/* Email e Telefone */}
        <div className={styles['form-row']}>
          <div className={styles['form-group']}>
            <label htmlFor="form-email">{getTexto('contato', 'form_email', 'Seu Email')} *</label>
            <input
              id="form-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              placeholder="seu@email.com"
              aria-label="Email"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="form-phone">{getTexto('contato', 'form_phone', 'Telefone')} *</label>
            <input
              id="form-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onInputChange}
              placeholder="(11) 9 1234-5678"
              aria-label="Telefone"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Assunto */}
        <div className={styles['form-group']}>
          <label htmlFor="form-subject">{getTexto('contato', 'form_subject', 'Assunto')} *</label>
          <select
            id="form-subject"
            name="subject"
            value={formData.subject}
            onChange={onInputChange}
            aria-label="Assunto da mensagem"
            required
            disabled={isLoading}
          >
            <option value="">
              {getTexto('contato', 'form_subject_placeholder', 'Selecione um assunto...')}
            </option>
            <option value="suporte">
              {getTexto('contato', 'form_subject_suporte', 'Suporte Técnico')}
            </option>
            <option value="reclamacao">
              {getTexto('contato', 'form_subject_reclamacao', 'Reclamação')}
            </option>
            <option value="sugestao">
              {getTexto('contato', 'form_subject_sugestao', 'Sugestão')}
            </option>
            <option value="parceria">
              {getTexto('contato', 'form_subject_parceria', 'Parceria')}
            </option>
            <option value="outros">{getTexto('contato', 'form_subject_outros', 'Outros')}</option>
          </select>
        </div>

        {/* Mensagem */}
        <div className={styles['form-group']}>
          <label htmlFor="form-message">{getTexto('contato', 'form_message', 'Mensagem')} *</label>
          <textarea
            id="form-message"
            name="message"
            value={formData.message}
            onChange={onInputChange}
            placeholder="Escreva sua mensagem aqui..."
            aria-label="Mensagem"
            required
            disabled={isLoading}
          />
        </div>

        {/* Feedback */}
        <FormMessage type={formMessage.type} text={formMessage.text} />

        {/* Botões */}
        <div className={styles['button-group']}>
          <button
            type="submit"
            className={styles['submit-btn']}
            disabled={isLoading}
            aria-label="Enviar formulário"
          >
            {getTexto('contato', 'form_submit', 'Enviar')}
          </button>
          <button
            type="button"
            className={styles['reset-btn']}
            onClick={onReset}
            disabled={isLoading}
            aria-label="Limpar formulário"
          >
            {getTexto('contato', 'form_reset', 'Limpar')}
          </button>
        </div>
      </form>
    </div>
  );

/**
 * MapSection - Mapa com parceiros
 * @returns {React.ReactElement}
 */
const MapSection = ({ mapRef }) =>
  isElementEnabled('map') && (
    <div className={styles['map-section']}>
      <h3 className={styles['map-title']}>
        <FontAwesomeIcon icon={faMapMarkerAlt} className={styles['map-icon']} aria-hidden="true" />
        {getTexto('contato', 'map_title', 'Nossas Unidades')}
      </h3>
      <div
        className={styles['map-container']}
        ref={mapRef}
       
        aria-label="Mapa interativo de localizações dos parceiros"
      />
      <p className={styles['map-attribution']}>
        ©{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
          OpenStreetMap contributors
        </a>
      </p>
    </div>
  );

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente Contato - Seção de contato completa
 * @returns {React.ReactElement}
 */
const Contato = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────────

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [formMessage, setFormMessage] = useState({ type: null, text: '' });
  const [parceiros, setParceiros] = useState([]);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Carrega parceiros da API
   */
  useEffect(() => {
    const carregarParceiros = async () => {
      try {
        const resultado = await buscarTodosParceiros(1, PARCEIROS_LIMIT);

        if (resultado.success && Array.isArray(resultado.data)) {
          const parceirosComLocalizacao = resultado.data
            .filter((p) => {
              const temLat = p.latitude !== null && p.latitude !== undefined;
              const temLng = p.longitude !== null && p.longitude !== undefined;
              const ativo = p.ativo === true;
              return temLat && temLng && ativo;
            })
            .map((p) => ({
              id: p.id,
              nome: p.nome,
              lat: parseFloat(p.latitude),
              lng: parseFloat(p.longitude),
              endereco: p.endereco,
              cidade: p.cidade,
              estado: p.estado,
              telefone: getLink('telefone', 'Support Formatted', ''),
            }));

          setParceiros(parceirosComLocalizacao);
        }
      } catch (error) {
        // eslint-disable-next-line no-console

        console.error('Erro ao carregar parceiros:', error);
      }
    };

    carregarParceiros();
  }, []);

  /**
   * Inicializa mapa Leaflet
   */
  useEffect(() => {
    if (!isElementEnabled('map') || !mapRef.current || parceiros.length === 0) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const lats = parceiros.map((p) => p.lat);
      const lngs = parceiros.map((p) => p.lng);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

      const map = L.map(mapRef.current).setView([centerLat, centerLng], 8);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 2,
      }).addTo(map);

      parceiros.forEach((parceiro) => {
        const marker = L.marker([parceiro.lat, parceiro.lng], {
          icon: L.icon({
            iconUrl:
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%234682B4" d="M12 0C6.48 0 2 4.48 2 10c0 7 10 14 10 14s10-7 10-14c0-5.52-4.48-10-10-10zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
        }).addTo(map);

        const enderecoCompleto = `${parceiro.endereco} - ${parceiro.cidade}, ${parceiro.estado}`;
        const popupContent = `
          <div class="${styles['map-popup']}">
            <strong>${parceiro.nome}</strong><br/>
            <small>${enderecoCompleto}</small><br/>
            <small><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" style="display:inline-block;margin-right:4px;vertical-align:middle;fill:#333"><path d="M17.92 7.02C17.45 6.18 16.51 5.55 15.46 5.12C15.68 5.59 15.84 6.09 15.91 6.59C16.13 8.23 15.8 9.85 15.19 10.74C14.59 11.64 13.78 12.37 12.87 12.88C11.53 13.77 10.06 14.21 8.58 14.21C8.33 14.21 8.08 14.2 7.84 14.16C8.08 14.33 8.32 14.5 8.58 14.61C9.7 15.11 10.93 15.35 12.16 15.35C14.35 15.35 16.43 14.68 18.04 13.55C19.65 12.42 20.88 10.81 21.57 9C22.27 7.18 22.48 5.19 22.14 3.29C21.5 4.85 20.27 6.18 17.92 7.02Z"/></svg>${parceiro.telefone}</small>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', function () {
          this.openPopup();
        });
      });

      mapInstanceRef.current = map;
    } catch (error) {
      // eslint-disable-next-line no-console

      console.error('Erro ao inicializar mapa:', error);
    }
  }, [parceiros]);

  /**
   * Cleanup do mapa
   */
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Manipula mudanças nos inputs
   */
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (formMessage.type) {
        setFormMessage({ type: null, text: '' });
      }
    },
    [formMessage.type]
  );

  /**
   * Valida formulário
   */
  const validateForm = useCallback(() => {
    const { name, email, phone, subject, message } = formData;

    if (!name.trim()) return { valid: false, error: 'Nome é obrigatório' };
    if (!email.trim()) return { valid: false, error: 'Email é obrigatório' };
    if (!validateEmail(email)) return { valid: false, error: 'Email inválido' };
    if (!phone.trim()) return { valid: false, error: 'Telefone é obrigatório' };
    if (!subject.trim()) return { valid: false, error: 'Assunto é obrigatório' };
    if (!message.trim()) return { valid: false, error: 'Mensagem é obrigatória' };
    return { valid: true };
  }, [formData]);

  /**
   * Manip subminissão do formulário
   */
  const handleFormSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const validation = validateForm();
      if (!validation.valid) {
        setFormMessage({ type: 'error', text: validation.error });
        return;
      }

      setFormMessage({
        type: 'loading',
        text: getTexto('messages', 'enviando', 'Enviando mensagem...'),
      });

      try {
        await new Promise((resolve) => setTimeout(resolve, SUBMIT_DELAY));

        setFormMessage({
          type: 'success',
          text: getTexto(
            'messages',
            'mensagemEnviada',
            'Mensagem enviada com sucesso! Entraremos em contato em breve.'
          ),
        });

        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

        setTimeout(() => {
          setFormMessage({ type: null, text: '' });
        }, MESSAGE_TIMEOUT);
      } catch (error) {
        // eslint-disable-next-line no-console

        console.error('Erro ao enviar:', error);
        setFormMessage({
          type: 'error',
          text: getTexto('messages', 'erroEnvio', 'Erro ao enviar mensagem. Tente novamente.'),
        });
      }
    },
    [validateForm]
  );

  /**
   * Reseta formulário
   */
  const handleReset = useCallback(() => {
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setFormMessage({ type: null, text: '' });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  const isLoading = formMessage.type === 'loading';

  return (
    <div className={styles.contato}>
      <ContatoHeader />
      <AllContactCards />
      <div className={styles['form-map-wrapper']}>
        <FormSection
          formData={formData}
          formMessage={formMessage}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onReset={handleReset}
        />
        <MapSection mapRef={mapRef} />
      </div>
    </div>
  );
};

export default Contato;


