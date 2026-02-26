// Constantes da aplicação

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const STATUS_ENUM = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  SUSPENSO: 'suspenso',
};

export const COMPONENT_TYPE = {
  GLOBAL: 'global',
  REUTILIZAVEL: 'reutilizável',
  ESPECIFICO: 'específico',
};

export const LINK_CATEGORY = {
  SOCIAL: 'social',
  PHONES: 'phones',
  EXTERNAL: 'external',
  ROUTES: 'routes',
  MENU: 'menu',
  COMPANY: 'company',
};

export const IMAGE_CATEGORY = {
  LOGOS: 'logos',
  BANNERS: 'banners',
  OFERTAS: 'ofertas',
  APPS: 'apps',
  FEATURES: 'features',
};

export const TEXT_CATEGORY = {
  COMPANY: 'company',
  HEADER: 'header',
  FOOTER: 'footer',
  INTRODUCAO: 'introdução',
  CONTATO: 'contato',
  SERVICOS: 'servicos',
  FAQ: 'faq',
  OFERTAS: 'ofertas',
};

export const COLOR_CATEGORY = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  NEUTRAL: 'neutral',
  STATUS: 'status',
  GRADIENTS: 'gradients',
  SHADOWS: 'shadows',
  SPECIAL: 'special',
};

export const API_MESSAGES = {
  SUCCESS: 'Operação realizada com sucesso',
  CREATED: 'Recurso criado com sucesso',
  UPDATED: 'Recurso atualizado com sucesso',
  DELETED: 'Recurso deletado com sucesso',
  NOT_FOUND: 'Recurso não encontrado',
  VALIDATION_ERROR: 'Erro de validação',
  AUTHORIZED_ERROR: 'Não autorizado',
  SERVER_ERROR: 'Erro interno do servidor',
};
