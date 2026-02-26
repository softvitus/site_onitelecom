/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0004_Componente', {
      com_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      com_nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      com_descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      com_tipo: {
        type: Sequelize.ENUM('global', 'reutilizável', 'específico'),
        allowNull: true,
      },
      com_possui_elementos: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      com_habilitado: {
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
    await queryInterface.addIndex('0004_Componente', ['com_tipo']);
    await queryInterface.addIndex('0004_Componente', ['com_habilitado']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0004_Componente');
  },
};
