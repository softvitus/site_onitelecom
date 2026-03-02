/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0061_Permissoes', {
      perm_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      perm_nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nome único da permissão (ex: criar_tema)',
      },
      perm_descricao: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Descrição da permissão',
      },
      perm_modulo: {
        type: Sequelize.ENUM(
          'tema',
          'pagina',
          'componente',
          'elemento',
          'usuario',
          'parceiro',
          'relatorios',
          'auditoria'
        ),
        allowNull: false,
        comment: 'Módulo relacionado',
      },
      perm_acao: {
        type: Sequelize.ENUM('criar', 'listar', 'editar', 'deletar', 'visualizar', 'exportar', 'estatisticas', 'filtrar'),
        allowNull: false,
        comment: 'Ação realizada',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Criar índices
    await queryInterface.addIndex('0061_Permissoes', ['perm_nome'], {
      name: 'idx_0061_permissoes_nome',
    });

    await queryInterface.addIndex('0061_Permissoes', ['perm_modulo'], {
      name: 'idx_0061_permissoes_modulo',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0061_Permissoes');
  },
};
