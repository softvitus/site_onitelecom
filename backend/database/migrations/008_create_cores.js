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
      cor_componente: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nome do componente (ex: Header, Ofertas, Footer)',
      },
      cor_variavel_ref: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Referência original da variável (ex: var(--color-primary))',
      },
      cor_descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição da cor e seu uso',
      },
      cor_ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica se a cor está ativa no sistema',
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
    await queryInterface.addIndex('0008_Cores', ['cor_componente']);
    await queryInterface.addIndex('0008_Cores', ['cor_ativo']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0008_Cores');
  },
};
