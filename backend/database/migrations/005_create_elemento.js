/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0005_Elemento', {
      ele_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      ele_nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      ele_descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ele_habilitado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      ele_obrigatório: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.addIndex('0005_Elemento', ['ele_habilitado']);
    await queryInterface.addIndex('0005_Elemento', ['ele_obrigatório']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0005_Elemento');
  },
};
