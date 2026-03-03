/** @type {import('sequelize-cli').Migration} */
import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    // Buscar todas as permissões para mapear aos roles
    const permissoes = await queryInterface.sequelize.query(
      'SELECT "perm_id", "perm_nome" FROM "0061_Permissoes" ORDER BY "perm_nome"',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Admin tem todas as permissões
    const adminPermissions = permissoes.map(p => ({
      roleperm_id: uuidv4(),
      roleperm_tipo: 'admin',
      roleperm_perm_id: p.perm_id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Gestor tem acesso COMPLETO (listar, visualizar, criar, editar, deletar)
    // Excluindo APENAS: parceiro (admin only), permissoes, role_permissoes
    const gestorPermissions = permissoes
      .filter(p => {
        // Parceiro é apenas para admin
        if (p.perm_nome.startsWith('parceiro_')) {
          return false;
        }
        // Pode gerenciar permissões? Não
        if (p.perm_nome.startsWith('permissoes_') || p.perm_nome.startsWith('role_permissoes_')) {
          return false;
        }
        return true;
      })
      .map(p => ({
        roleperm_id: uuidv4(),
        roleperm_tipo: 'gestor',
        roleperm_perm_id: p.perm_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    // Usuário tem acesso COMPLETO (listar, visualizar, criar, editar, deletar) a módulos específicos:
    // COMPLETO: tema, pagina, componente, elemento, imagens, links, textos, conteudo, cores, features, config_tema
    // ZERO: parceiro, usuario, permissoes, role_permissoes, auditoria
    const usuarioPermissions = permissoes
      .filter(p => {
        // Módulos que o usuário tem acesso COMPLETO (CRUD)
        const modulosCompletos = ['tema', 'pagina', 'componente', 'elemento', 'imagens', 'links', 'textos', 'conteudo', 'cores', 'features', 'config_tema'];
        
        // Módulos que o usuário NÃO tem acesso algum
        const modulosSemAcesso = ['parceiro', 'usuario', 'permissoes', 'role_permissoes', 'auditoria'];
        
        // Se é um módulo sem acesso, bloquear completamente
        if (modulosSemAcesso.some(modulo => p.perm_nome.startsWith(modulo + '_'))) {
          return false;
        }
        
        // Se é um módulo com acesso completo, permitir todas as ações
        if (modulosCompletos.some(modulo => p.perm_nome.startsWith(modulo + '_'))) {
          return true;
        }
        
        return false;
      })
      .map(p => ({
        roleperm_id: uuidv4(),
        roleperm_tipo: 'usuario',
        roleperm_perm_id: p.perm_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    const allRolePermissions = [
      ...adminPermissions,
      ...gestorPermissions,
      ...usuarioPermissions,
    ];

    await queryInterface.bulkInsert('0062_RolePermissoes', allRolePermissions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('0062_RolePermissoes', {});
  },
};
