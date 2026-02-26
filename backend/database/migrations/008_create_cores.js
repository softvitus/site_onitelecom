/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0008_Cores', {
      cor_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      cor_tem_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0002_Tema',
          key: 'tem_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cor_categoria: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      cor_nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      cor_valor: {
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
    await queryInterface.addIndex('0008_Cores', ['cor_tem_id']);
    await queryInterface.addIndex('0008_Cores', ['cor_categoria']);
    await queryInterface.addIndex('0008_Cores', ['cor_nome']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0008_Cores');
  },
};
