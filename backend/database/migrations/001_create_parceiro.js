/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0001_Parceiro', {
      par_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      par_nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      par_dominio: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      par_cidade: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      par_estado: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: 'UF - Unidade Federativa (estado)',
      },
      par_endereco: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      par_cep: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      par_latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
        comment: 'Latitude em graus decimais',
      },
      par_longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
        comment: 'Longitude em graus decimais',
      },
      par_raio_cobertura: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 50,
        comment: 'Raio de cobertura em km',
      },
      par_status: {
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
    await queryInterface.addIndex('0001_Parceiro', ['par_status']);
    await queryInterface.addIndex('0001_Parceiro', ['par_dominio']);
    // Índice para localizações (geo queries)
    await queryInterface.addIndex('0001_Parceiro', ['par_latitude', 'par_longitude']);
    await queryInterface.addIndex('0001_Parceiro', ['par_cep']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0001_Parceiro');
  },
};
