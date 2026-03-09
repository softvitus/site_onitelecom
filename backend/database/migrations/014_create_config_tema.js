/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0014_Config_Tema', {
      cfg_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      cfg_tem_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0002_Tema',
          key: 'tem_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cfg_chave: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      cfg_valor: {
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
    await queryInterface.addIndex('0014_Config_Tema', ['cfg_tem_id']);
    await queryInterface.addIndex('0014_Config_Tema', ['cfg_chave']);

    // Criar UNIQUE constraint
    await queryInterface.addConstraint('0014_Config_Tema', {
      fields: ['cfg_tem_id', 'cfg_chave'],
      type: 'unique',
      name: 'uq_cfg_tema_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0014_Config_Tema');
  },
};
