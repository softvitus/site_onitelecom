import express from 'express';
import { ParceiroController } from '../controllers/ParceiroController.js';
import { TemaController } from '../controllers/TemaController.js';
import { PaginaController } from '../controllers/PaginaController.js';
import { ComponenteController } from '../controllers/ComponenteController.js';
import { ElementoController } from '../controllers/ElementoController.js';
import { PagComRelController } from '../controllers/PagComRelController.js';
import { ComEleRelController } from '../controllers/ComEleRelController.js';
import { CoresController } from '../controllers/CoresController.js';
import { ImagensController } from '../controllers/ImagensController.js';
import { LinksController } from '../controllers/LinksController.js';
import { TextosController } from '../controllers/TextosController.js';
import { ConteudoController } from '../controllers/ConteudoController.js';
import { FeaturesController } from '../controllers/FeaturesController.js';
import { ConfigTemaController } from '../controllers/ConfigTemaController.js';
import { AuditoriaController } from '../controllers/AuditoriaController.js';
import { AuthController } from '../controllers/AuthController.js';
import { UsuariosController } from '../controllers/UsuariosController.js';
import { PermissoesController } from '../controllers/PermissoesController.js';
import { RolePermissoesController } from '../controllers/RolePermissoesController.js';
import { validate, schemas, validateTokenOnly } from '../middleware/index.js';
import { authenticate, requirePermission } from '../middleware/index.js';

const router = express.Router();

// Instancia todos os controllers
const authController = new AuthController();
const parceiroController = new ParceiroController();
const temaController = new TemaController();
const paginaController = new PaginaController();
const componenteController = new ComponenteController();
const elementoController = new ElementoController();
const pagComRelController = new PagComRelController();
const comEleRelController = new ComEleRelController();
const coresController = new CoresController();
const imagensController = new ImagensController();
const linksController = new LinksController();
const textosController = new TextosController();
const conteudoController = new ConteudoController();
const featuresController = new FeaturesController();
const configTemaController = new ConfigTemaController();
const auditoriaController = new AuditoriaController();
const usuariosController = new UsuariosController();
const permissoesController = new PermissoesController();
const rolePermissoesController = new RolePermissoesController();

// ============================================================
// ROTAS PÚBLICAS SEM AUTENTICAÇÃO
// ============================================================

// GET /public/parceiros - Lista todos os parceiros ativos (sem autenticação)
router.get('/public/parceiros', (req, res, next) =>
  parceiroController.getPublicAll(req, res, next),
);

// GET /public/parceiros/:id/tema - Busca o tema de um parceiro (sem autenticação)
router.get('/public/parceiros/:id/tema', (req, res, next) =>
  parceiroController.getPublicTemaById(req, res, next),
);

// GET /public/parceiros/proximos/:latitude/:longitude - Busca parceiros próximos (usa geolocalização do modal)
router.get('/public/parceiros/proximos/:latitude/:longitude', (req, res, next) =>
  parceiroController.getPublicNearby(req, res, next),
);

// ============================================================
// ROTAS PÚBLICAS (Requerem token válido apenas)
// ============================================================

// GET /public/parceiros/por-cidade/:cidade - Busca parceiros ativos por cidade
router.get('/public/parceiros/por-cidade/:cidade', validateTokenOnly, (req, res, next) =>
  parceiroController.getPublicByCity(req, res, next),
);

// ============================================================
// ROTAS DE AUTENTICAÇÃO
// ============================================================

// POST /auth/login - Autentica usuário e gera token JWT
router.post('/auth/login', (req, res, next) =>
  authController.login(req, res, next),
);

// POST /auth/verify - Verifica se um token é válido
router.post('/auth/verify', (req, res, next) =>
  authController.verifyToken(req, res, next),
);

// POST /auth/logout - Faz logout do usuário
router.post('/auth/logout', authenticate, (req, res, next) =>
  authController.logout(req, res, next),
);

// GET /auth/me - Retorna dados do usuário autenticado
router.get('/auth/me', authenticate, (req, res, next) =>
  authController.getCurrentUser(req, res, next),
);

// GET /auth/me/permissoes - Retorna permissões do usuário
router.get('/auth/me/permissoes', authenticate, (req, res, next) =>
  authController.getMyPermissions(req, res, next),
);

// POST /auth/refresh - Gera novo token JWT
router.post('/auth/refresh', authenticate, (req, res, next) =>
  authController.refreshToken(req, res, next),
);

// POST /auth/change-password - Altera senha do usuário
router.post('/auth/change-password', authenticate, (req, res, next) =>
  authController.changePassword(req, res, next),
);

// Rotas para Parceiro
router.get('/parceiros', authenticate, requirePermission('parceiro_listar'), parceiroController.getAll.bind(parceiroController));
router.post('/parceiros', authenticate, requirePermission('parceiro_criar'), validate(schemas.createParceiro), parceiroController.create.bind(parceiroController));
router.get('/parceiros/:id', authenticate, requirePermission('parceiro_visualizar'), parceiroController.getById.bind(parceiroController));
router.put('/parceiros/:id', authenticate, requirePermission('parceiro_editar'), parceiroController.update.bind(parceiroController));
router.delete('/parceiros/:id', authenticate, requirePermission('parceiro_deletar'), parceiroController.remove.bind(parceiroController));
router.get('/parceiros/nearby/:latitude/:longitude', authenticate, requirePermission('parceiro_listar'), parceiroController.getNearby.bind(parceiroController));

// Rotas para Tema
router.get('/temas', authenticate, requirePermission('tema_listar'), temaController.getAll.bind(temaController));
router.post('/temas', authenticate, requirePermission('tema_criar'), validate(schemas.createTema), temaController.create.bind(temaController));
router.get('/temas/:id', authenticate, requirePermission('tema_visualizar'), temaController.getById.bind(temaController));
router.put('/temas/:id', authenticate, requirePermission('tema_editar'), temaController.update.bind(temaController));
router.delete('/temas/:id', authenticate, requirePermission('tema_deletar'), temaController.remove.bind(temaController));

// Rotas para Página
router.get('/paginas', authenticate, requirePermission('pagina_listar'), paginaController.getAll.bind(paginaController));
router.post('/paginas', authenticate, requirePermission('pagina_criar'), validate(schemas.createPagina), paginaController.create.bind(paginaController));
router.get('/paginas/:id', authenticate, requirePermission('pagina_visualizar'), paginaController.getById.bind(paginaController));
router.put('/paginas/:id', authenticate, requirePermission('pagina_editar'), paginaController.update.bind(paginaController));
router.delete('/paginas/:id', authenticate, requirePermission('pagina_deletar'), paginaController.remove.bind(paginaController));

// Rotas para Componente
router.get('/componentes', authenticate, requirePermission('componente_listar'), componenteController.getAll.bind(componenteController));
router.post('/componentes', authenticate, requirePermission('componente_criar'), validate(schemas.createComponente), componenteController.create.bind(componenteController));
router.get('/componentes/:id', authenticate, requirePermission('componente_visualizar'), componenteController.getById.bind(componenteController));
router.put('/componentes/:id', authenticate, requirePermission('componente_editar'), componenteController.update.bind(componenteController));
router.delete('/componentes/:id', authenticate, requirePermission('componente_deletar'), componenteController.remove.bind(componenteController));

// Rotas para Elemento
router.get('/elementos', authenticate, requirePermission('elemento_listar'), elementoController.getAll.bind(elementoController));
router.post('/elementos', authenticate, requirePermission('elemento_criar'), elementoController.create.bind(elementoController));
router.get('/elementos/:id', authenticate, requirePermission('elemento_visualizar'), elementoController.getById.bind(elementoController));
router.put('/elementos/:id', authenticate, requirePermission('elemento_editar'), elementoController.update.bind(elementoController));
router.delete('/elementos/:id', authenticate, requirePermission('elemento_deletar'), elementoController.remove.bind(elementoController));

// Rotas para PagComRel (Página-Componente)
router.get('/pag-com-rels', authenticate, requirePermission('pagina_visualizar'), pagComRelController.getAll.bind(pagComRelController));
router.post('/pag-com-rels', authenticate, requirePermission('pagina_editar'), pagComRelController.create.bind(pagComRelController));
router.get('/pag-com-rels/:id', authenticate, requirePermission('pagina_visualizar'), pagComRelController.getById.bind(pagComRelController));
router.put('/pag-com-rels/:id', authenticate, requirePermission('pagina_editar'), pagComRelController.update.bind(pagComRelController));
router.delete('/pag-com-rels/:id', authenticate, requirePermission('pagina_editar'), pagComRelController.remove.bind(pagComRelController));

// Rotas para ComEleRel (Componente-Elemento)
router.get('/com-ele-rels', authenticate, requirePermission('componente_visualizar'), comEleRelController.getAll.bind(comEleRelController));
router.post('/com-ele-rels', authenticate, requirePermission('componente_editar'), comEleRelController.create.bind(comEleRelController));
router.get('/com-ele-rels/:id', authenticate, requirePermission('componente_visualizar'), comEleRelController.getById.bind(comEleRelController));
router.put('/com-ele-rels/:id', authenticate, requirePermission('componente_editar'), comEleRelController.update.bind(comEleRelController));
router.delete('/com-ele-rels/:id', authenticate, requirePermission('componente_editar'), comEleRelController.remove.bind(comEleRelController));

// Rotas para Cores
router.get('/cores', authenticate, requirePermission('tema_visualizar'), coresController.getAll.bind(coresController));
router.post('/cores', authenticate, requirePermission('tema_editar'), coresController.create.bind(coresController));
router.get('/cores/:id', authenticate, requirePermission('tema_visualizar'), coresController.getById.bind(coresController));
router.put('/cores/:id', authenticate, requirePermission('tema_editar'), coresController.update.bind(coresController));
router.delete('/cores/:id', authenticate, requirePermission('tema_editar'), coresController.remove.bind(coresController));

// Rotas para Imagens
router.get('/imagens', authenticate, requirePermission('tema_visualizar'), imagensController.getAll.bind(imagensController));
router.post('/imagens', authenticate, requirePermission('tema_editar'), imagensController.create.bind(imagensController));
router.get('/imagens/:id', authenticate, requirePermission('tema_visualizar'), imagensController.getById.bind(imagensController));
router.put('/imagens/:id', authenticate, requirePermission('tema_editar'), imagensController.update.bind(imagensController));
router.delete('/imagens/:id', authenticate, requirePermission('tema_editar'), imagensController.remove.bind(imagensController));

// Rotas para Links
router.get('/links', authenticate, requirePermission('tema_visualizar'), linksController.getAll.bind(linksController));
router.post('/links', authenticate, requirePermission('tema_editar'), linksController.create.bind(linksController));
router.get('/links/:id', authenticate, requirePermission('tema_visualizar'), linksController.getById.bind(linksController));
router.put('/links/:id', authenticate, requirePermission('tema_editar'), linksController.update.bind(linksController));
router.delete('/links/:id', authenticate, requirePermission('tema_editar'), linksController.remove.bind(linksController));

// Rotas para Textos
router.get('/textos', authenticate, requirePermission('tema_visualizar'), textosController.getAll.bind(textosController));
router.post('/textos', authenticate, requirePermission('tema_editar'), textosController.create.bind(textosController));
router.get('/textos/:id', authenticate, requirePermission('tema_visualizar'), textosController.getById.bind(textosController));
router.put('/textos/:id', authenticate, requirePermission('tema_editar'), textosController.update.bind(textosController));
router.delete('/textos/:id', authenticate, requirePermission('tema_editar'), textosController.remove.bind(textosController));

// Rotas para Conteúdo
router.get('/conteudos', authenticate, requirePermission('pagina_visualizar'), conteudoController.getAll.bind(conteudoController));
router.post('/conteudos', authenticate, requirePermission('pagina_editar'), conteudoController.create.bind(conteudoController));
router.get('/conteudos/:id', authenticate, requirePermission('pagina_visualizar'), conteudoController.getById.bind(conteudoController));
router.put('/conteudos/:id', authenticate, requirePermission('pagina_editar'), conteudoController.update.bind(conteudoController));
router.delete('/conteudos/:id', authenticate, requirePermission('pagina_editar'), conteudoController.remove.bind(conteudoController));

// Rotas para Features
router.get('/features', authenticate, requirePermission('tema_visualizar'), featuresController.getAll.bind(featuresController));
router.post('/features', authenticate, requirePermission('tema_editar'), featuresController.create.bind(featuresController));
router.get('/features/:id', authenticate, requirePermission('tema_visualizar'), featuresController.getById.bind(featuresController));
router.put('/features/:id', authenticate, requirePermission('tema_editar'), featuresController.update.bind(featuresController));
router.delete('/features/:id', authenticate, requirePermission('tema_editar'), featuresController.remove.bind(featuresController));

// Rotas para Configuração de Tema
router.get('/config-temas', authenticate, requirePermission('tema_visualizar'), configTemaController.getAll.bind(configTemaController));
router.post('/config-temas', authenticate, requirePermission('tema_editar'), configTemaController.create.bind(configTemaController));
router.get('/config-temas/:id', authenticate, requirePermission('tema_visualizar'), configTemaController.getById.bind(configTemaController));
router.put('/config-temas/:id', authenticate, requirePermission('tema_editar'), configTemaController.update.bind(configTemaController));
router.delete('/config-temas/:id', authenticate, requirePermission('tema_editar'), configTemaController.remove.bind(configTemaController));

// ============================================================
// ROTAS DE USUÁRIOS
// ============================================================

// GET /usuarios - Lista todos os usuários
router.get('/usuarios', authenticate, requirePermission('usuario_listar'), usuariosController.getAll.bind(usuariosController));

// POST /usuarios - Cria novo usuário
router.post('/usuarios', authenticate, requirePermission('usuario_criar'), usuariosController.create.bind(usuariosController));

// GET /usuarios/:id - Busca usuário por ID
router.get('/usuarios/:id', authenticate, requirePermission('usuario_visualizar'), usuariosController.getById.bind(usuariosController));

// PUT /usuarios/:id - Atualiza usuário
router.put('/usuarios/:id', authenticate, requirePermission('usuario_editar'), usuariosController.update.bind(usuariosController));

// DELETE /usuarios/:id - Deleta usuário
router.delete('/usuarios/:id', authenticate, requirePermission('usuario_deletar'), usuariosController.remove.bind(usuariosController));

// GET /usuarios/tipo/:tipo - Lista usuários por tipo (role)
router.get('/usuarios/tipo/:tipo', authenticate, requirePermission('usuario_listar'), usuariosController.getByType.bind(usuariosController));

// PUT /usuarios/:id/status - Atualiza status do usuário
router.put('/usuarios/:id/status', authenticate, requirePermission('usuario_editar'), usuariosController.updateStatus.bind(usuariosController));

// ============================================================
// ROTAS DE PERMISSÕES
// ============================================================

// GET /permissoes - Lista todas as permissões
router.get('/permissoes', authenticate, requirePermission('permissao_listar'), permissoesController.getAll.bind(permissoesController));

// POST /permissoes - Cria nova permissão
router.post('/permissoes', authenticate, requirePermission('permissao_criar'), permissoesController.create.bind(permissoesController));

// GET /permissoes/:id - Busca permissão por ID
router.get('/permissoes/:id', authenticate, requirePermission('permissao_visualizar'), permissoesController.getById.bind(permissoesController));

// PUT /permissoes/:id - Atualiza permissão
router.put('/permissoes/:id', authenticate, requirePermission('permissao_editar'), permissoesController.update.bind(permissoesController));

// DELETE /permissoes/:id - Deleta permissão
router.delete('/permissoes/:id', authenticate, requirePermission('permissao_deletar'), permissoesController.remove.bind(permissoesController));

// GET /permissoes/modulo/:modulo - Lista permissões por módulo
router.get('/permissoes/modulo/:modulo', authenticate, requirePermission('permissao_visualizar'), permissoesController.getByModulo.bind(permissoesController));

// GET /permissoes/acao/:acao - Lista permissões por ação
router.get('/permissoes/acao/:acao', authenticate, requirePermission('permissao_visualizar'), permissoesController.getByAcao.bind(permissoesController));

// ============================================================
// ROTAS DE ROLE-PERMISSÕES
// ============================================================

// GET /role-permissoes - Lista todas as role-permissões com paginação
router.get('/role-permissoes', authenticate, requirePermission('usuario_visualizar'), rolePermissoesController.getAll.bind(rolePermissoesController));

// POST /role-permissoes - Cria nova role-permissão
router.post('/role-permissoes', authenticate, requirePermission('auditoria_visualizar'), rolePermissoesController.create.bind(rolePermissoesController));

// GET /role-permissoes/:tipo - Lista permissões de um role (admin, gestor, usuario)
router.get('/role-permissoes/:tipo([a-z]+)', authenticate, requirePermission('usuario_visualizar'), rolePermissoesController.getByTipo.bind(rolePermissoesController));

// GET /role-permissoes/:id - Busca role-permissão por ID
router.get('/role-permissoes/:id([a-f0-9\\-]+)', authenticate, requirePermission('usuario_visualizar'), rolePermissoesController.getById.bind(rolePermissoesController));

// PUT /role-permissoes/:id - Atualiza role-permissão
router.put('/role-permissoes/:id', authenticate, requirePermission('auditoria_visualizar'), rolePermissoesController.update.bind(rolePermissoesController));

// DELETE /role-permissoes/:id - Deleta role-permissão
router.delete('/role-permissoes/:id', authenticate, requirePermission('auditoria_visualizar'), rolePermissoesController.remove.bind(rolePermissoesController));

// GET /role-permissoes/:tipo/tem/:permissaoNome - Verifica se role tem permissão
router.get('/role-permissoes/:tipo/tem/:permissaoNome', authenticate, requirePermission('usuario_visualizar'), rolePermissoesController.temPermissao.bind(rolePermissoesController));

// POST /role-permissoes/:tipo/permissoes/:permissaoId - Atribui permissão ao role
router.post('/role-permissoes/:tipo/permissoes/:permissaoId', authenticate, requirePermission('auditoria_visualizar'), rolePermissoesController.atribuirPermissao.bind(rolePermissoesController));

// DELETE /role-permissoes/:tipo/permissoes/:permissaoId - Remove permissão do role
router.delete('/role-permissoes/:tipo/permissoes/:permissaoId', authenticate, requirePermission('auditoria_visualizar'), rolePermissoesController.removerPermissao.bind(rolePermissoesController));

// PUT /role-permissoes/:tipo/permissoes - Substitui todas as permissões do role
router.put('/role-permissoes/:tipo/permissoes', authenticate, requirePermission('auditoria_visualizar'), rolePermissoesController.replacePermissoes.bind(rolePermissoesController));

// ============================================================
// ROTAS DE AUDITORIA (Requer permissão: auditoria_visualizar)
// ============================================================

// GET /auditoria - Lista logs de auditoria com filtros
router.get('/auditoria', authenticate, requirePermission('auditoria_visualizar'), auditoriaController.listar.bind(auditoriaController));

// GET /auditoria/estatisticas - Estatísticas dos logs
router.get('/auditoria/estatisticas', authenticate, requirePermission('auditoria_visualizar'), auditoriaController.estatisticas.bind(auditoriaController));

// GET /auditoria/usuario/:usuarioId - Logs de um usuário específico
router.get('/auditoria/usuario/:usuarioId', authenticate, requirePermission('auditoria_visualizar'), auditoriaController.porUsuario.bind(auditoriaController));

// GET /auditoria/entidade/:entidade/:entidadeId - Logs de uma entidade específica
router.get('/auditoria/entidade/:entidade/:entidadeId', authenticate, requirePermission('auditoria_visualizar'), auditoriaController.porEntidade.bind(auditoriaController));

// GET /auditoria/:id - Obtém um registro específico
router.get('/auditoria/:id', authenticate, requirePermission('auditoria_visualizar'), auditoriaController.obter.bind(auditoriaController));

export default router;
