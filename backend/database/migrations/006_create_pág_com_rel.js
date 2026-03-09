/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0006_Pág_Com_Rel', {
      pcr_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      pcr_pag_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0003_Página',
          key: 'pag_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      pcr_com_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0004_Componente',
          key: 'com_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      pcr_ordem: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      pcr_habilitado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.addIndex('0006_Pág_Com_Rel', ['pcr_pag_id']);
    await queryInterface.addIndex('0006_Pág_Com_Rel', ['pcr_com_id']);
    await queryInterface.addIndex('0006_Pág_Com_Rel', ['pcr_habilitado']);

    // UNIQUE constraint: uma página não pode ter o mesmo componente mais de uma vez
    await queryInterface.addConstraint('0006_Pág_Com_Rel', {
      fields: ['pcr_pag_id', 'pcr_com_id'],
      type: 'unique',
      name: 'unique_pagina_componente',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0006_Pág_Com_Rel');
  },
};
