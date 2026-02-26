/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0011_Textos', {
      txt_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      txt_tem_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0002_Tema',
          key: 'tem_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      txt_categoria: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      txt_chave: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      txt_valor: {
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
    await queryInterface.addIndex('0011_Textos', ['txt_tem_id']);
    await queryInterface.addIndex('0011_Textos', ['txt_categoria']);
    await queryInterface.addIndex('0011_Textos', ['txt_chave']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0011_Textos');
  },
};
