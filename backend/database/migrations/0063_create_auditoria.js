/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('0063_Auditoria', {
      aud_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      aud_usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '0060_Usuarios',
          key: 'usu_id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: 'ID do usuário que realizou a ação',
      },
      aud_acao: {
        type: Sequelize.ENUM('criar', 'editar', 'deletar', 'visualizar', 'inativar', 'ativar', 'login', 'logout'),
        allowNull: false,
        comment: 'Tipo de ação realizada',
      },
      aud_entidade: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Tipo de entidade afetada (parceiro, tema, usuario, etc)',
      },
      aud_entidade_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'ID da entidade afetada',
      },
      aud_dados_anteriores: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Dados antes da modificação (apenas para editar/deletar)',
      },
      aud_dados_novos: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Dados após a modificação (apenas para criar/editar)',
      },
      aud_ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP do cliente que realizou a ação',
      },
      aud_user_agent: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'User Agent do navegador/cliente',
      },
      aud_status: {
        type: Sequelize.ENUM('sucesso', 'erro'),
        defaultValue: 'sucesso',
        allowNull: false,
        comment: 'Status da operação',
      },
      aud_mensagem_erro: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Mensagem de erro (se status = erro)',
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

    // Criar índices para busca rápida
    await queryInterface.addIndex('0063_Auditoria', ['aud_usuario_id'], {
      name: 'idx_0063_auditoria_usuario_id',
    });

    await queryInterface.addIndex('0063_Auditoria', ['aud_acao'], {
      name: 'idx_0063_auditoria_acao',
    });

    await queryInterface.addIndex('0063_Auditoria', ['aud_entidade'], {
      name: 'idx_0063_auditoria_entidade',
    });

    await queryInterface.addIndex('0063_Auditoria', ['aud_entidade_id'], {
      name: 'idx_0063_auditoria_entidade_id',
    });

    await queryInterface.addIndex('0063_Auditoria', ['createdAt'], {
      name: 'idx_0063_auditoria_created_at',
    });

    // Índice composto para buscas mais eficientes
    await queryInterface.addIndex('0063_Auditoria', ['aud_usuario_id', 'createdAt'], {
      name: 'idx_0063_auditoria_usuario_data',
    });

    await queryInterface.addIndex('0063_Auditoria', ['aud_entidade', 'aud_entidade_id', 'createdAt'], {
      name: 'idx_0063_auditoria_entidade_completo',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0063_Auditoria');
  },
};
