/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0002_Tema', {
      tem_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      tem_par_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0001_Parceiro',
          key: 'par_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tem_nome: {
        type: Sequelize.STRING(255),
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
    await queryInterface.addIndex('0002_Tema', ['tem_par_id']);
    await queryInterface.addIndex('0002_Tema', ['tem_nome']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0002_Tema');
  },
};
