/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0060_Usuarios', {
      usu_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      usu_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Email único do usuário',
      },
      usu_nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nome completo do usuário',
      },
      usu_senha: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Senha hash (bcrypt)',
      },
      usu_telefone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Telefone de contato',
      },
      usu_status: {
        type: Sequelize.ENUM('ativo', 'inativo', 'bloqueado'),
        defaultValue: 'ativo',
        allowNull: false,
        comment: 'Status do usuário',
      },
      usu_tipo: {
        type: Sequelize.ENUM('admin', 'gestor', 'usuario'),
        defaultValue: 'usuario',
        allowNull: false,
        comment: 'Tipo de usuário (role)',
      },
      usu_ultimo_acesso: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data e hora do último acesso',
      },
      usu_tentativas_login: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Número de tentativas de login falhadas',
      },
      usu_parceiro_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: '0001_Parceiro',
          key: 'par_id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'ID do Parceiro (obrigatório para gestor e usuario)',
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
    await queryInterface.addIndex('0060_Usuarios', ['usu_email'], {
      name: 'idx_0060_usuarios_email',
    });

    await queryInterface.addIndex('0060_Usuarios', ['usu_status'], {
      name: 'idx_0060_usuarios_status',
    });

    await queryInterface.addIndex('0060_Usuarios', ['usu_parceiro_id'], {
      name: 'idx_0060_usuarios_parceiro_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0060_Usuarios');
  },
};
