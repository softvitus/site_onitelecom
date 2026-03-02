/** @type {import('sequelize-cli').Migration} */
import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    // Definir todas as permissões do sistema com UUIDs
    const permissoes = [
      // Permissões de Tema
      { perm_id: uuidv4(), perm_nome: 'tema_listar', perm_descricao: 'Listar temas', perm_modulo: 'tema', perm_acao: 'listar' },
      { perm_id: uuidv4(), perm_nome: 'tema_visualizar', perm_descricao: 'Visualizar detalhes tema', perm_modulo: 'tema', perm_acao: 'visualizar' },
      { perm_id: uuidv4(), perm_nome: 'tema_criar', perm_descricao: 'Criar novo tema', perm_modulo: 'tema', perm_acao: 'criar' },
      { perm_id: uuidv4(), perm_nome: 'tema_editar', perm_descricao: 'Editar tema', perm_modulo: 'tema', perm_acao: 'editar' },
      { perm_id: uuidv4(), perm_nome: 'tema_deletar', perm_descricao: 'Deletar tema', perm_modulo: 'tema', perm_acao: 'deletar' },

      // Permissões de Página
      { perm_id: uuidv4(), perm_nome: 'pagina_listar', perm_descricao: 'Listar páginas', perm_modulo: 'pagina', perm_acao: 'listar' },
      { perm_id: uuidv4(), perm_nome: 'pagina_visualizar', perm_descricao: 'Visualizar detalhes página', perm_modulo: 'pagina', perm_acao: 'visualizar' },
      { perm_id: uuidv4(), perm_nome: 'pagina_criar', perm_descricao: 'Criar nova página', perm_modulo: 'pagina', perm_acao: 'criar' },
      { perm_id: uuidv4(), perm_nome: 'pagina_editar', perm_descricao: 'Editar página', perm_modulo: 'pagina', perm_acao: 'editar' },
      { perm_id: uuidv4(), perm_nome: 'pagina_deletar', perm_descricao: 'Deletar página', perm_modulo: 'pagina', perm_acao: 'deletar' },

      // Permissões de Componente
      { perm_id: uuidv4(), perm_nome: 'componente_listar', perm_descricao: 'Listar componentes', perm_modulo: 'componente', perm_acao: 'listar' },
      { perm_id: uuidv4(), perm_nome: 'componente_visualizar', perm_descricao: 'Visualizar detalhes componente', perm_modulo: 'componente', perm_acao: 'visualizar' },
      { perm_id: uuidv4(), perm_nome: 'componente_criar', perm_descricao: 'Criar novo componente', perm_modulo: 'componente', perm_acao: 'criar' },
      { perm_id: uuidv4(), perm_nome: 'componente_editar', perm_descricao: 'Editar componente', perm_modulo: 'componente', perm_acao: 'editar' },
      { perm_id: uuidv4(), perm_nome: 'componente_deletar', perm_descricao: 'Deletar componente', perm_modulo: 'componente', perm_acao: 'deletar' },

      // Permissões de Elemento
      { perm_id: uuidv4(), perm_nome: 'elemento_listar', perm_descricao: 'Listar elementos', perm_modulo: 'elemento', perm_acao: 'listar' },
      { perm_id: uuidv4(), perm_nome: 'elemento_visualizar', perm_descricao: 'Visualizar detalhes elemento', perm_modulo: 'elemento', perm_acao: 'visualizar' },
      { perm_id: uuidv4(), perm_nome: 'elemento_criar', perm_descricao: 'Criar novo elemento', perm_modulo: 'elemento', perm_acao: 'criar' },
      { perm_id: uuidv4(), perm_nome: 'elemento_editar', perm_descricao: 'Editar elemento', perm_modulo: 'elemento', perm_acao: 'editar' },
      { perm_id: uuidv4(), perm_nome: 'elemento_deletar', perm_descricao: 'Deletar elemento', perm_modulo: 'elemento', perm_acao: 'deletar' },

      // Permissões de Usuário
      { perm_id: uuidv4(), perm_nome: 'usuario_listar', perm_descricao: 'Listar usuários', perm_modulo: 'usuario', perm_acao: 'listar' },
      { perm_id: uuidv4(), perm_nome: 'usuario_visualizar', perm_descricao: 'Visualizar detalhes usuário', perm_modulo: 'usuario', perm_acao: 'visualizar' },
      { perm_id: uuidv4(), perm_nome: 'usuario_criar', perm_descricao: 'Criar novo usuário', perm_modulo: 'usuario', perm_acao: 'criar' },
      { perm_id: uuidv4(), perm_nome: 'usuario_editar', perm_descricao: 'Editar usuário', perm_modulo: 'usuario', perm_acao: 'editar' },
      { perm_id: uuidv4(), perm_nome: 'usuario_deletar', perm_descricao: 'Deletar usuário', perm_modulo: 'usuario', perm_acao: 'deletar' },

      // Permissões de Parceiro
      { perm_id: uuidv4(), perm_nome: 'parceiro_listar', perm_descricao: 'Listar parceiros', perm_modulo: 'parceiro', perm_acao: 'listar' },
      { perm_id: uuidv4(), perm_nome: 'parceiro_visualizar', perm_descricao: 'Visualizar detalhes parceiro', perm_modulo: 'parceiro', perm_acao: 'visualizar' },
      { perm_id: uuidv4(), perm_nome: 'parceiro_criar', perm_descricao: 'Criar novo parceiro', perm_modulo: 'parceiro', perm_acao: 'criar' },
      { perm_id: uuidv4(), perm_nome: 'parceiro_editar', perm_descricao: 'Editar parceiro', perm_modulo: 'parceiro', perm_acao: 'editar' },
      { perm_id: uuidv4(), perm_nome: 'parceiro_deletar', perm_descricao: 'Deletar parceiro', perm_modulo: 'parceiro', perm_acao: 'deletar' },

      // Permissões de Relatórios
      { perm_id: uuidv4(), perm_nome: 'relatorios_listar', perm_descricao: 'Listar relatórios', perm_modulo: 'relatorios', perm_acao: 'listar' },
      { perm_id: uuidv4(), perm_nome: 'relatorios_visualizar', perm_descricao: 'Visualizar relatórios', perm_modulo: 'relatorios', perm_acao: 'visualizar' },

      // Permissões de Auditoria
      { perm_id: uuidv4(), perm_nome: 'auditoria_listar', perm_descricao: 'Listar registros de auditoria', perm_modulo: 'auditoria', perm_acao: 'listar' },
      { perm_id: uuidv4(), perm_nome: 'auditoria_visualizar', perm_descricao: 'Visualizar detalhes de auditoria', perm_modulo: 'auditoria', perm_acao: 'visualizar' },
      { perm_id: uuidv4(), perm_nome: 'auditoria_filtrar', perm_descricao: 'Filtrar registros de auditoria', perm_modulo: 'auditoria', perm_acao: 'filtrar' },
    ];

    // Armazenar IDs para usar no seed de role permissoes
    await queryInterface.bulkInsert('0061_Permissoes',
      permissoes.map(p => ({
        ...p,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('0061_Permissoes', {});
  },
};
