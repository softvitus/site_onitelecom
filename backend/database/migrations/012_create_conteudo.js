/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0012_Conteudo', {
      cnt_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      cnt_tem_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0002_Tema',
          key: 'tem_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cnt_tipo: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      cnt_categoria: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      cnt_titulo: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      cnt_descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cnt_dados: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      cnt_ordem: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      cnt_habilitado: {
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
    await queryInterface.addIndex('0012_Conteudo', ['cnt_tem_id']);
    await queryInterface.addIndex('0012_Conteudo', ['cnt_tipo']);
    await queryInterface.addIndex('0012_Conteudo', ['cnt_categoria']);
    await queryInterface.addIndex('0012_Conteudo', ['cnt_habilitado']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0012_Conteudo');
  },
};
