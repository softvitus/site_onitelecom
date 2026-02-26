/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0009_Imagens', {
      img_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      img_tem_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0002_Tema',
          key: 'tem_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      img_categoria: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      img_nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      img_valor: {
        type: Sequelize.TEXT,
        allowNull: false,
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
    await queryInterface.addIndex('0009_Imagens', ['img_tem_id']);
    await queryInterface.addIndex('0009_Imagens', ['img_categoria']);
    await queryInterface.addIndex('0009_Imagens', ['img_nome']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0009_Imagens');
  },
};
