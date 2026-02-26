
import { ParceiroService } from '../services/index.js';
import { getModels } from '../models/loader.js';

/**
 * ParceiroController - Refatorado para usar Service Layer
 */
export class ParceiroController {
  constructor() {
    const models = getModels();
    this.service = new ParceiroService(models.Parceiro);
  }

  /**
   * GET /api/parceiros
   * Lista todos os parceiros com paginação
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const result = await this.service.findAll(
        {},
        { page: parseInt(page), limit: parseInt(limit) }
      );

      return res.json({
        success: true,
        data: result.rows,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/parceiros/:id
   * Busca parceiro por ID com todas as relações
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findByIdWithRelations(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Parceiro não encontrado',
        });
      }

      return res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/parceiros
   * Cria novo parceiro
   */
  async create(req, res, next) {
    try {
      const item = await this.service.createPayload(req.body);

      return res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/parceiros/:id
   * Atualiza parceiro
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.update(id, req.body);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Parceiro não encontrado',
        });
      }

      return res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/parceiros/:id
   * Deleta parceiro
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Parceiro não encontrado',
        });
      }

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/parceiros/filtro/cidade/:cidade
   * Busca parceiros por cidade
   */
  async getByCity(req, res, next) {
    try {
      const { cidade } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.service.findByCity(
        cidade,
        { page: parseInt(page), limit: parseInt(limit) }
      );

      return res.json({
        success: true,
        data: result.rows || result,
        pagination: result.pagination || undefined,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/parceiros/ativo/all
   * Lista apenas parceiros ativos
   */
  async getActive(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await this.service.findActive({
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.json({
        success: true,
        data: result.rows || result,
        pagination: result.pagination || undefined,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/parceiros/:id/toggle-status
   * Ativa/desativa parceiro
   */
  async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.toggleStatus(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Parceiro não encontrado',
        });
      }

      return res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/parceiros/nearby/:latitude/:longitude
   * Busca parceiros próximos às coordenadas
   */
  async getNearby(req, res, next) {
    try {
      const { latitude, longitude } = req.params;
      const { radius = 50, page = 1, limit = 10 } = req.query;

      const result = await this.service.findNearby(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius),
        { page: parseInt(page), limit: parseInt(limit) }
      );

      return res.json({
        success: true,
        data: result.rows,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/public/parceiros/por-cidade/:cidade
   * Busca parceiros ativos por cidade (PÚBLICO - apenas token requerido)
   */
  /**
   * GET /api/public/parceiros
   * Lista todos os parceiros ativos (PÚBLICO - sem autenticação)
   */
  async getPublicAll(req, res, next) {
    try {
      const { page = 1, limit = 100 } = req.query;

      const result = await this.service.findActive({
        page: parseInt(page),
        limit: parseInt(limit),
      });

      // Parceiros já filtrados por status 'ativo' pelo service
      const parceiros = Array.isArray(result.rows) ? result.rows : (result || []);

      // Mapear para retornar apenas campos públicos
      const parceirosPulicos = parceiros.map(p => ({
        id: p.par_id,
        nome: p.par_nome,
        dominio: p.par_dominio,
        endereco: p.par_endereco,
        cidade: p.par_cidade,
        estado: p.par_estado,
        cep: p.par_cep,
        telefone: p.par_telefone,
        latitude: p.par_latitude,
        longitude: p.par_longitude,
        raioCobertura: p.par_raio_cobertura,
        ativo: p.par_status === 'ativo',
      }));

      return res.json({
        success: true,
        data: parceirosPulicos,
        pagination: result.pagination || undefined,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/public/parceiros/por-cidade/:cidade
   * Busca parceiros ativos por cidade (PÚBLICO - sem autenticação)
   */
  async getPublicByCity(req, res, next) {
    try {
      const { cidade } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.service.findByCity(
        cidade,
        { page: parseInt(page), limit: parseInt(limit) }
      );

      // Filtrar apenas parceiros ativos e retornar dados públicos
      const parceiros = Array.isArray(result.rows || result) 
        ? (result.rows || result).filter(p => p.par_status === 'ativo')
        : [];

      // Mapear para retornar apenas campos públicos
      const parceirosPulicos = parceiros.map(p => ({
        id: p.par_id,
        nome: p.par_nome,
        dominio: p.par_dominio,
        endereco: p.par_endereco,
        cidade: p.par_cidade,
        estado: p.par_estado,
        telefone: p.par_telefone,
        latitude: p.par_latitude,
        longitude: p.par_longitude,
        raioCobertura: p.par_raio_cobertura,
        ativo: p.par_status === 'ativo',
      }));

      return res.json({
        success: true,
        data: parceirosPulicos,
        pagination: result.pagination || undefined,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/public/parceiros/proximos/:latitude/:longitude
   * Busca parceiros ativos próximos às coordenadas (PÚBLICO - sem autenticação)
   */
  async getPublicNearby(req, res, next) {
    try {
      const { latitude, longitude } = req.params;
      const { radius = 50, page = 1, limit = 10 } = req.query;

      const result = await this.service.findNearby(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius),
        { page: parseInt(page), limit: parseInt(limit) }
      );

      // Filtrar apenas parceiros ativos e retornar dados públicos
      const parceiros = Array.isArray(result.rows) 
        ? result.rows.filter(p => p.par_status === 'ativo')
        : [];

      // Mapear para retornar apenas campos públicos
      const parceirosPulicos = parceiros.map(p => ({
        id: p.par_id,
        nome: p.par_nome,
        dominio: p.par_dominio,
        endereco: p.par_endereco,
        cidade: p.par_cidade,
        estado: p.par_estado,
        telefone: p.par_telefone,
        latitude: p.par_latitude,
        longitude: p.par_longitude,
        raioCobertura: p.par_raio_cobertura,
        ativo: p.par_status === 'ativo',
        distancia: p.distancia, // Campo calculado pelo serviço
      }));

      return res.json({
        success: true,
        data: parceirosPulicos,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/public/parceiros/:id/tema
   * Busca o tema ativo de um parceiro com todas as páginas, componentes e elementos (PÚBLICO - sem autenticação)
   */
  async getPublicTemaById(req, res, next) {
    try {
      const { id } = req.params;
      const { getModels } = await import('../models/loader.js');
      const models = getModels();

      // Verifica se é UUID ou slug/nome e busca o parceiro adequadamente
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      let parceiro;
      if (isUUID) {
        // Busca por UUID
        parceiro = await this.service.findByIdWithRelations(id);
      } else {
        // Busca por slug (par_nome normalizado)
        const normalizedSlug = id.toLowerCase().replace(/[^a-z0-9]/g, '');
        const allParceiros = await models.Parceiro.findAll({
          include: [{ association: 'temas' }],
        });
        parceiro = allParceiros.find(p => {
          const parceiroSlug = p.par_nome.toLowerCase().replace(/[^a-z0-9]/g, '');
          return parceiroSlug === normalizedSlug;
        });
      }

      if (!parceiro || parceiro.par_status !== 'ativo') {
        return res.status(404).json({
          success: false,
          error: 'Parceiro não encontrado ou inativo',
        });
      }

      // Busca o primeiro tema ativo do parceiro (geralmente apenas um)
      const temas = parceiro.temas || [];
      const temaAtivo = temas.length > 0 ? temas[0] : null;

      if (!temaAtivo) {
        return res.status(404).json({
          success: false,
          error: 'Nenhum tema configurado para este parceiro',
        });
      }

      // Busca todas as páginas do tema com componentes e elementos
      const paginas = await models.Pagina.findAll({
        where: {
          pag_tem_id: temaAtivo.tem_id,
          pag_status: 'ativo',
        },
        include: [
          {
            model: models.Componente,
            as: 'componentes',
            through: {
              attributes: ['pcr_id', 'pcr_ordem', 'pcr_habilitado'],
            },
            where: {
              com_habilitado: true, // ✅ FILTRA: Apenas componentes habilitados globalmente
            },
            required: false, // ✅ FIX: LEFT JOIN em vez de INNER JOIN
            order: [['PagComRel', 'pcr_ordem', 'ASC']], // ✅ ORDENA componentes por pcr_ordem
            include: [
              {
                model: models.Elemento,
                as: 'elementos',
                through: {
                  attributes: ['cer_id', 'cer_ordem', 'cer_habilitado'],
                },
                where: {
                  ele_habilitado: true, // ✅ FILTRA: Apenas elementos habilitados globalmente
                },
                required: false, // ✅ FIX: LEFT JOIN em vez de INNER JOIN
                order: [['ComEleRel', 'cer_ordem', 'ASC']], // ✅ ORDENA elementos por cer_ordem
              },
            ],
          },
        ],
        order: [['pag_ordem_menu', 'ASC']],
        raw: false,
      });

      // Busca todas as cores do tema
      const cores = await models.Cores.findAll({
        where: {
          cor_tem_id: temaAtivo.tem_id,
        },
        order: [['cor_categoria', 'ASC'], ['cor_nome', 'ASC']],
        raw: false,
      });

      // Busca todas as imagens do tema
      const imagens = await models.Imagens.findAll({
        where: {
          img_tem_id: temaAtivo.tem_id,
        },
        order: [['img_categoria', 'ASC'], ['img_nome', 'ASC']],
        raw: false,
      });

      // Busca todos os textos do tema
      const textos = await models.Textos.findAll({
        where: {
          txt_tem_id: temaAtivo.tem_id,
        },
        order: [['txt_categoria', 'ASC'], ['txt_chave', 'ASC']],
        raw: false,
      });

      // Busca todos os links do tema
      const links = await models.Links.findAll({
        where: {
          lin_tem_id: temaAtivo.tem_id,
        },
        order: [['lin_categoria', 'ASC'], ['lin_nome', 'ASC']],
        raw: false,
      });

      // Busca todos os conteúdos do tema
      const conteudos = await models.Conteudo.findAll({
        where: {
          cnt_tem_id: temaAtivo.tem_id,
          cnt_habilitado: true,
        },
        order: [['cnt_categoria', 'ASC'], ['cnt_ordem', 'ASC']],
        raw: false,
      });

      // Busca todas as features do tema
      const features = await models.Features.findAll({
        where: {
          fea_tem_id: temaAtivo.tem_id,
          fea_habilitado: true,
        },
        order: [['fea_nome', 'ASC']],
        raw: false,
      });

      // Busca todas as configurações do tema
      const configs = await models.ConfigTema.findAll({
        where: {
          cfg_tem_id: temaAtivo.tem_id,
        },
        order: [['cfg_chave', 'ASC']],
        raw: false,
      });

      // Mapear páginas para formato público
      const paginasPublicas = paginas.map(p => ({
        id: p.pag_id,
        nome: p.pag_nome,
        caminho: p.pag_caminho,
        titulo: p.pag_titulo,
        categoria: p.pag_categoria,
        mostrarNoMenu: p.pag_mostrar_no_menu,
        etiquetaMenu: p.pag_etiqueta_menu,
        ordemMenu: p.pag_ordem_menu,
        icone: p.pag_icone,
        componentes: (p.componentes || [])
          // ✅ FILTRA: Apenas componentes habilitados nesta página
          .filter(c => c['PagComRel']?.pcr_habilitado === true)
          .map(c => ({
            id: c.com_id,
            nome: c.com_nome,
            tipo: c.com_tipo,
            descricao: c.com_descricao,
            habilitado: c.com_habilitado, // Se está habilitado globalmente
            habilitadoNaPagina: c['PagComRel']?.pcr_habilitado === true, // Se está habilitado nesta página
            ordem: c['PagComRel']?.pcr_ordem || 999, // Ordem do componente na página
            elementos: (c.elementos || [])
              // ✅ FILTRA: Apenas elementos habilitados neste componente
              .filter(e => e['ComEleRel']?.cer_habilitado === true)
              .map(e => ({
                id: e.ele_id,
                nome: e.ele_nome,
                tipo: e.ele_tipo,
                chave: e.ele_chave,
                valor: e.ele_valor,
                habilitado: e.ele_habilitado, // Se está habilitado globalmente
                habilitadoNoComponente: e['ComEleRel']?.cer_habilitado === true, // Se está habilitado neste componente
                ordem: e['ComEleRel']?.cer_ordem || 999, // Ordem do elemento no componente
                propriedades: e.ele_propriedades,
              })),
          })),
      }));

      // Mapear cores para formato público
      const coresPublicas = cores.map(c => ({
        id: c.cor_id,
        categoria: c.cor_categoria,
        nome: c.cor_nome,
        valor: c.cor_valor,
      }));

      // Mapear imagens para formato público
      const imagensPublicas = imagens.map(i => ({
        id: i.img_id,
        categoria: i.img_categoria,
        nome: i.img_nome,
        valor: i.img_valor,
      }));

      // Mapear textos para formato público
      const textosPublicos = textos.map(t => ({
        id: t.txt_id,
        categoria: t.txt_categoria,
        chave: t.txt_chave,
        valor: t.txt_valor,
      }));

      // Mapear links para formato público
      const linksPublicos = links.map(l => ({
        id: l.lin_id,
        categoria: l.lin_categoria,
        nome: l.lin_nome,
        valor: l.lin_valor,
      }));

      // Mapear conteúdos para formato público
      const conteudosPublicos = conteudos.map(c => ({
        id: c.cnt_id,
        tipo: c.cnt_tipo,
        categoria: c.cnt_categoria,
        titulo: c.cnt_titulo,
        descricao: c.cnt_descricao,
        dados: c.cnt_dados,
        ordem: c.cnt_ordem,
      }));

      // Mapear features para formato público
      const featuresPublicas = features.map(f => ({
        id: f.fea_id,
        nome: f.fea_nome,
      }));

      // Mapear configs para formato público
      const configsPublicas = configs.map(c => ({
        id: c.cfg_id,
        chave: c.cfg_chave,
        valor: c.cfg_valor,
      }));

      return res.json({
        success: true,
        data: {
          id: temaAtivo.tem_id,
          nome: temaAtivo.tem_nome,
          parceiroId: temaAtivo.tem_par_id,
          paginas: paginasPublicas,
          cores: coresPublicas,
          imagens: imagensPublicas,
          textos: textosPublicos,
          links: linksPublicos,
          conteudos: conteudosPublicos,
          features: featuresPublicas,
          configs: configsPublicas,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
// Instancia o controller
export const parceiroController = new ParceiroController();
// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => parceiroController.getAll(req, res, next);
export const getById = (req, res, next) => parceiroController.getById(req, res, next);
export const create = (req, res, next) => parceiroController.create(req, res, next);
export const update = (req, res, next) => parceiroController.update(req, res, next);
export const remove = (req, res, next) => parceiroController.remove(req, res, next);
export const getNearby = (req, res, next) => parceiroController.getNearby(req, res, next);
