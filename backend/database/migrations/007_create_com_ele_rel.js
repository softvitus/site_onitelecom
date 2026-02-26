/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0007_Com_Ele_Rel', {
      cer_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      cer_com_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0004_Componente',
          key: 'com_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cer_ele_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0005_Elemento',
          key: 'ele_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cer_ordem: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      cer_habilitado: {
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
    await queryInterface.addIndex('0007_Com_Ele_Rel', ['cer_com_id']);
    await queryInterface.addIndex('0007_Com_Ele_Rel', ['cer_ele_id']);
    await queryInterface.addIndex('0007_Com_Ele_Rel', ['cer_habilitado']);
    
    // Criar UNIQUE constraint
    await queryInterface.addConstraint('0007_Com_Ele_Rel', {
      fields: ['cer_com_id', 'cer_ele_id'],
      type: 'unique',
      name: 'uq_com_ele_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0007_Com_Ele_Rel');
  },
};
