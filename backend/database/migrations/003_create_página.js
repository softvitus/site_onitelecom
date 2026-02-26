/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0003_Página', {
      pag_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      pag_par_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0001_Parceiro',
          key: 'par_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      pag_tem_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0002_Tema',
          key: 'tem_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      pag_nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      pag_caminho: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      pag_titulo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      pag_mostrar_no_menu: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      pag_etiqueta_menu: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pag_ordem_menu: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      pag_icone: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      pag_categoria: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      pag_status: {
        type: Sequelize.ENUM('ativo', 'inativo', 'suspenso'),
        allowNull: false,
        defaultValue: 'ativo',
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
    await queryInterface.addIndex('0003_Página', ['pag_par_id']);
    await queryInterface.addIndex('0003_Página', ['pag_tem_id']);
    await queryInterface.addIndex('0003_Página', ['pag_status']);
    await queryInterface.addIndex('0003_Página', ['pag_caminho']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0003_Página');
  },
};
