/** @type {import('sequelize-cli').Migration} */
import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    // Definir todas as permissões do sistema com UUIDs
    const permissoes = [
      // Permissões de Tema
      {
        perm_id: uuidv4(),
        perm_nome: 'tema_listar',
        perm_descricao: 'Listar temas',
        perm_modulo: 'tema',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'tema_visualizar',
        perm_descricao: 'Visualizar detalhes tema',
        perm_modulo: 'tema',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'tema_criar',
        perm_descricao: 'Criar novo tema',
        perm_modulo: 'tema',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'tema_editar',
        perm_descricao: 'Editar tema',
        perm_modulo: 'tema',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'tema_deletar',
        perm_descricao: 'Deletar tema',
        perm_modulo: 'tema',
        perm_acao: 'deletar',
      },

      // Permissões de Página
      {
        perm_id: uuidv4(),
        perm_nome: 'pagina_listar',
        perm_descricao: 'Listar páginas',
        perm_modulo: 'pagina',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'pagina_visualizar',
        perm_descricao: 'Visualizar detalhes página',
        perm_modulo: 'pagina',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'pagina_criar',
        perm_descricao: 'Criar nova página',
        perm_modulo: 'pagina',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'pagina_editar',
        perm_descricao: 'Editar página',
        perm_modulo: 'pagina',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'pagina_deletar',
        perm_descricao: 'Deletar página',
        perm_modulo: 'pagina',
        perm_acao: 'deletar',
      },

      // Permissões de Componente
      {
        perm_id: uuidv4(),
        perm_nome: 'componente_listar',
        perm_descricao: 'Listar componentes',
        perm_modulo: 'componente',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'componente_visualizar',
        perm_descricao: 'Visualizar detalhes componente',
        perm_modulo: 'componente',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'componente_criar',
        perm_descricao: 'Criar novo componente',
        perm_modulo: 'componente',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'componente_editar',
        perm_descricao: 'Editar componente',
        perm_modulo: 'componente',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'componente_deletar',
        perm_descricao: 'Deletar componente',
        perm_modulo: 'componente',
        perm_acao: 'deletar',
      },

      // Permissões de Elemento
      {
        perm_id: uuidv4(),
        perm_nome: 'elemento_listar',
        perm_descricao: 'Listar elementos',
        perm_modulo: 'elemento',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'elemento_visualizar',
        perm_descricao: 'Visualizar detalhes elemento',
        perm_modulo: 'elemento',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'elemento_criar',
        perm_descricao: 'Criar novo elemento',
        perm_modulo: 'elemento',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'elemento_editar',
        perm_descricao: 'Editar elemento',
        perm_modulo: 'elemento',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'elemento_deletar',
        perm_descricao: 'Deletar elemento',
        perm_modulo: 'elemento',
        perm_acao: 'deletar',
      },

      // Permissões de Usuário
      {
        perm_id: uuidv4(),
        perm_nome: 'usuario_listar',
        perm_descricao: 'Listar usuários',
        perm_modulo: 'usuario',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'usuario_visualizar',
        perm_descricao: 'Visualizar detalhes usuário',
        perm_modulo: 'usuario',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'usuario_criar',
        perm_descricao: 'Criar novo usuário',
        perm_modulo: 'usuario',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'usuario_editar',
        perm_descricao: 'Editar usuário',
        perm_modulo: 'usuario',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'usuario_deletar',
        perm_descricao: 'Deletar usuário',
        perm_modulo: 'usuario',
        perm_acao: 'deletar',
      },

      // Permissões de Parceiro
      {
        perm_id: uuidv4(),
        perm_nome: 'parceiro_listar',
        perm_descricao: 'Listar parceiros',
        perm_modulo: 'parceiro',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'parceiro_visualizar',
        perm_descricao: 'Visualizar detalhes parceiro',
        perm_modulo: 'parceiro',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'parceiro_criar',
        perm_descricao: 'Criar novo parceiro',
        perm_modulo: 'parceiro',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'parceiro_editar',
        perm_descricao: 'Editar parceiro',
        perm_modulo: 'parceiro',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'parceiro_deletar',
        perm_descricao: 'Deletar parceiro',
        perm_modulo: 'parceiro',
        perm_acao: 'deletar',
      },

      // Permissões de Relatórios
      {
        perm_id: uuidv4(),
        perm_nome: 'relatorios_listar',
        perm_descricao: 'Listar relatórios',
        perm_modulo: 'relatorios',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'relatorios_visualizar',
        perm_descricao: 'Visualizar relatórios',
        perm_modulo: 'relatorios',
        perm_acao: 'visualizar',
      },

      // Permissões de Auditoria
      {
        perm_id: uuidv4(),
        perm_nome: 'auditoria_listar',
        perm_descricao: 'Listar registros de auditoria',
        perm_modulo: 'auditoria',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'auditoria_visualizar',
        perm_descricao: 'Visualizar detalhes de auditoria',
        perm_modulo: 'auditoria',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'auditoria_filtrar',
        perm_descricao: 'Filtrar registros de auditoria',
        perm_modulo: 'auditoria',
        perm_acao: 'filtrar',
      },

      // Permissões de Cores
      {
        perm_id: uuidv4(),
        perm_nome: 'cores_listar',
        perm_descricao: 'Listar cores',
        perm_modulo: 'cores',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'cores_visualizar',
        perm_descricao: 'Visualizar cores',
        perm_modulo: 'cores',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'cores_criar',
        perm_descricao: 'Criar cores',
        perm_modulo: 'cores',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'cores_editar',
        perm_descricao: 'Editar cores',
        perm_modulo: 'cores',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'cores_deletar',
        perm_descricao: 'Deletar cores',
        perm_modulo: 'cores',
        perm_acao: 'deletar',
      },

      // Permissões de Imagens
      {
        perm_id: uuidv4(),
        perm_nome: 'imagens_listar',
        perm_descricao: 'Listar imagens',
        perm_modulo: 'imagens',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'imagens_visualizar',
        perm_descricao: 'Visualizar imagens',
        perm_modulo: 'imagens',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'imagens_criar',
        perm_descricao: 'Criar imagens',
        perm_modulo: 'imagens',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'imagens_editar',
        perm_descricao: 'Editar imagens',
        perm_modulo: 'imagens',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'imagens_deletar',
        perm_descricao: 'Deletar imagens',
        perm_modulo: 'imagens',
        perm_acao: 'deletar',
      },

      // Permissões de Links
      {
        perm_id: uuidv4(),
        perm_nome: 'links_listar',
        perm_descricao: 'Listar links',
        perm_modulo: 'links',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'links_visualizar',
        perm_descricao: 'Visualizar links',
        perm_modulo: 'links',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'links_criar',
        perm_descricao: 'Criar links',
        perm_modulo: 'links',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'links_editar',
        perm_descricao: 'Editar links',
        perm_modulo: 'links',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'links_deletar',
        perm_descricao: 'Deletar links',
        perm_modulo: 'links',
        perm_acao: 'deletar',
      },

      // Permissões de Textos
      {
        perm_id: uuidv4(),
        perm_nome: 'textos_listar',
        perm_descricao: 'Listar textos',
        perm_modulo: 'textos',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'textos_visualizar',
        perm_descricao: 'Visualizar textos',
        perm_modulo: 'textos',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'textos_criar',
        perm_descricao: 'Criar textos',
        perm_modulo: 'textos',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'textos_editar',
        perm_descricao: 'Editar textos',
        perm_modulo: 'textos',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'textos_deletar',
        perm_descricao: 'Deletar textos',
        perm_modulo: 'textos',
        perm_acao: 'deletar',
      },

      // Permissões de Conteúdo
      {
        perm_id: uuidv4(),
        perm_nome: 'conteudo_listar',
        perm_descricao: 'Listar conteúdos',
        perm_modulo: 'conteudo',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'conteudo_visualizar',
        perm_descricao: 'Visualizar conteúdos',
        perm_modulo: 'conteudo',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'conteudo_criar',
        perm_descricao: 'Criar conteúdos',
        perm_modulo: 'conteudo',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'conteudo_editar',
        perm_descricao: 'Editar conteúdos',
        perm_modulo: 'conteudo',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'conteudo_deletar',
        perm_descricao: 'Deletar conteúdos',
        perm_modulo: 'conteudo',
        perm_acao: 'deletar',
      },

      // Permissões de Features
      {
        perm_id: uuidv4(),
        perm_nome: 'features_listar',
        perm_descricao: 'Listar features',
        perm_modulo: 'features',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'features_visualizar',
        perm_descricao: 'Visualizar features',
        perm_modulo: 'features',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'features_criar',
        perm_descricao: 'Criar features',
        perm_modulo: 'features',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'features_editar',
        perm_descricao: 'Editar features',
        perm_modulo: 'features',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'features_deletar',
        perm_descricao: 'Deletar features',
        perm_modulo: 'features',
        perm_acao: 'deletar',
      },

      // Permissões de Config Tema
      {
        perm_id: uuidv4(),
        perm_nome: 'config_tema_listar',
        perm_descricao: 'Listar configurações de tema',
        perm_modulo: 'config_tema',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'config_tema_visualizar',
        perm_descricao: 'Visualizar configurações de tema',
        perm_modulo: 'config_tema',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'config_tema_criar',
        perm_descricao: 'Criar configurações de tema',
        perm_modulo: 'config_tema',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'config_tema_editar',
        perm_descricao: 'Editar configurações de tema',
        perm_modulo: 'config_tema',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'config_tema_deletar',
        perm_descricao: 'Deletar configurações de tema',
        perm_modulo: 'config_tema',
        perm_acao: 'deletar',
      },

      // Permissões de Role Permissões
      {
        perm_id: uuidv4(),
        perm_nome: 'role_permissoes_listar',
        perm_descricao: 'Listar role permissões',
        perm_modulo: 'role_permissoes',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'role_permissoes_visualizar',
        perm_descricao: 'Visualizar role permissões',
        perm_modulo: 'role_permissoes',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'role_permissoes_criar',
        perm_descricao: 'Criar role permissões',
        perm_modulo: 'role_permissoes',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'role_permissoes_editar',
        perm_descricao: 'Editar role permissões',
        perm_modulo: 'role_permissoes',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'role_permissoes_deletar',
        perm_descricao: 'Deletar role permissões',
        perm_modulo: 'role_permissoes',
        perm_acao: 'deletar',
      },

      // Permissões de Permissões
      {
        perm_id: uuidv4(),
        perm_nome: 'permissoes_listar',
        perm_descricao: 'Listar permissões',
        perm_modulo: 'permissoes',
        perm_acao: 'listar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'permissoes_visualizar',
        perm_descricao: 'Visualizar permissões',
        perm_modulo: 'permissoes',
        perm_acao: 'visualizar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'permissoes_criar',
        perm_descricao: 'Criar permissões',
        perm_modulo: 'permissoes',
        perm_acao: 'criar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'permissoes_editar',
        perm_descricao: 'Editar permissões',
        perm_modulo: 'permissoes',
        perm_acao: 'editar',
      },
      {
        perm_id: uuidv4(),
        perm_nome: 'permissoes_deletar',
        perm_descricao: 'Deletar permissões',
        perm_modulo: 'permissoes',
        perm_acao: 'deletar',
      },
    ];

    // Armazenar IDs para usar no seed de role permissoes
    await queryInterface.bulkInsert(
      '0061_Permissoes',
      permissoes.map((p) => ({
        ...p,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('0061_Permissoes', {});
  },
};
