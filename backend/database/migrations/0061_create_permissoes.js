/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Limpar ENUMs antigos se existirem
    try {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_0061_Permissoes_perm_modulo" CASCADE;',
      );
    } catch (error) {
      console.log(
        'Limpeza de enum_0061_Permissoes_perm_modulo:',
        error.message,
      );
    }

    try {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_0061_Permissoes_perm_acao" CASCADE;',
      );
    } catch (error) {
      console.log('Limpeza de enum_0061_Permissoes_perm_acao:', error.message);
    }

    await queryInterface.createTable('0061_Permissoes', {
      perm_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      perm_nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nome único da permissão (ex: criar_tema)',
      },
      perm_descricao: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Descrição da permissão',
      },
      perm_modulo: {
        type: Sequelize.ENUM(
          'tema',
          'temas',
          'pagina',
          'paginas',
          'componente',
          'componentes',
          'elemento',
          'elementos',
          'usuario',
          'usuarios',
          'parceiro',
          'parceiros',
          'relatorios',
          'auditoria',
          'cores',
          'imagens',
          'links',
          'textos',
          'conteudo',
          'conteudos',
          'features',
          'config_tema',
          'role_permissoes',
          'permissoes',
        ),
        allowNull: false,
        comment: 'Módulo relacionado',
      },
      perm_acao: {
        type: Sequelize.ENUM(
          'criar',
          'listar',
          'editar',
          'deletar',
          'visualizar',
          'exportar',
          'estatisticas',
          'filtrar',
          'leituradados',
        ),
        allowNull: false,
        comment: 'Ação realizada',
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
    await queryInterface.addIndex('0061_Permissoes', ['perm_nome'], {
      name: 'idx_0061_permissoes_nome',
    });

    await queryInterface.addIndex('0061_Permissoes', ['perm_modulo'], {
      name: 'idx_0061_permissoes_modulo',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('0061_Permissoes');
  },
};
