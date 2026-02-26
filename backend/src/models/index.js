import createParceiroModel from './Parceiro.js';
import createTemaModel from './Tema.js';
import createPaginaModel from './Pagina.js';
import createComponenteModel from './Componente.js';
import createElementoModel from './Elemento.js';
import createPagComRelModel from './PagComRel.js';
import createComEleRelModel from './ComEleRel.js';
import createCoresModel from './Cores.js';
import createImagensModel from './Imagens.js';
import createLinksModel from './Links.js';
import createTextosModel from './Textos.js';
import createConteudoModel from './Conteudo.js';
import createFeaturesModel from './Features.js';
import createConfigTemaModel from './ConfigTema.js';
import createUsuarioModel from './Usuario.js';
import createPermissaoModel from './Permissao.js';
import createRolePermissaoModel from './RolePermissao.js';

/**
 * Inicializa todos os modelos com a instância do sequelize
 */
export function loadModels(sequelize) {
  const Parceiro = createParceiroModel(sequelize);
  const Tema = createTemaModel(sequelize);
  const Pagina = createPaginaModel(sequelize);
  const Componente = createComponenteModel(sequelize);
  const Elemento = createElementoModel(sequelize);
  const PagComRel = createPagComRelModel(sequelize);
  const ComEleRel = createComEleRelModel(sequelize);
  const Cores = createCoresModel(sequelize);
  const Imagens = createImagensModel(sequelize);
  const Links = createLinksModel(sequelize);
  const Textos = createTextosModel(sequelize);
  const Conteudo = createConteudoModel(sequelize);
  const Features = createFeaturesModel(sequelize);
  const ConfigTema = createConfigTemaModel(sequelize);
  const Usuario = createUsuarioModel(sequelize);
  const Permissao = createPermissaoModel(sequelize);
  const RolePermissao = createRolePermissaoModel(sequelize);

  const models = {
    Parceiro,
    Tema,
    Pagina,
    Componente,
    Elemento,
    PagComRel,
    ComEleRel,
    Cores,
    Imagens,
    Links,
    Textos,
    Conteudo,
    Features,
    ConfigTema,
    Usuario,
    Permissao,
    RolePermissao,
  };

  // Define all associations
  Object.values(models).forEach((model) => {
    if (model.associate) {
      model.associate(models);
    }
  });

  return models;
}

export {
  createParceiroModel,
  createTemaModel,
  createPaginaModel,
  createComponenteModel,
  createElementoModel,
  createPagComRelModel,
  createComEleRelModel,
  createCoresModel,
  createImagensModel,
  createLinksModel,
  createTextosModel,
  createConteudoModel,
  createFeaturesModel,
  createConfigTemaModel,
  createUsuarioModel,
  createPermissaoModel,
  createRolePermissaoModel,
};
