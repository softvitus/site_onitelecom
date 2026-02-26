/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0062_RolePermissoes', {
      roleperm_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      roleperm_tipo: {
        type: Sequelize.ENUM('admin', 'gestor', 'usuario'),
        allowNull: false,
        comment: 'Tipo de usuário',
      },
      roleperm_perm_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0061_Permissoes',
          key: 'perm_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
    await queryInterface.addIndex('0062_RolePermissoes', ['roleperm_tipo'], {
      name: 'idx_0062_roleperm_tipo',
    });

    await queryInterface.addIndex('0062_RolePermissoes', ['roleperm_perm_id'], {
      name: 'idx_0062_roleperm_perm_id',
    });

    // Constraint única: um tipo não pode ter a mesma permissão duas vezes
    await queryInterface.addConstraint('0062_RolePermissoes', {
      fields: ['roleperm_tipo', 'roleperm_perm_id'],
      type: 'unique',
      name: 'uk_0062_roleperm_tipo_perm',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0062_RolePermissoes');
  },
};
