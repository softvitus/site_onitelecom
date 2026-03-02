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

    // Gestor tem acesso a 22 permissões (listar, visualizar, criar, editar para cada módulo, mas não deletar)
    const gestorPermissions = permissoes
      .filter(p => !p.perm_nome.includes('_deletar') && !p.perm_nome.startsWith('usuario_') && !p.perm_nome.startsWith('parceiro_'))
      .map(p => ({
        roleperm_id: uuidv4(),
        roleperm_tipo: 'gestor',
        roleperm_perm_id: p.perm_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    // Usuário tem acesso apenas a listar e visualizar (excluindo admin e auditoria)
    const usuarioPermissions = permissoes
      .filter(p => p.perm_nome.endsWith('_listar') || p.perm_nome.endsWith('_visualizar'))
      .filter(p => !p.perm_nome.startsWith('usuario_') && !p.perm_nome.startsWith('parceiro_') && !p.perm_nome.startsWith('auditoria_'))
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
