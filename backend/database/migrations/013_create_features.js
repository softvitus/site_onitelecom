/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0013_Features', {
      fea_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      fea_tem_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0002_Tema',
          key: 'tem_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fea_nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      fea_habilitado: {
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
    await queryInterface.addIndex('0013_Features', ['fea_tem_id']);
    await queryInterface.addIndex('0013_Features', ['fea_nome']);
    await queryInterface.addIndex('0013_Features', ['fea_habilitado']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0013_Features');
  },
};
