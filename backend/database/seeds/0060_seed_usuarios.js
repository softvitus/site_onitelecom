/** @type {import('sequelize-cli').Migration} */
import bcrypt from 'bcryptjs';

export default {
  async up(queryInterface, Sequelize) {
    // Buscar um parceiro existente para vincular usuários
    const parceiros = await queryInterface.sequelize.query(
      'SELECT "par_id" FROM "0001_Parceiro" LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT },
    );

    const parceiroId = parceiros.length > 0 ? parceiros[0].par_id : null;

    // Gerar hashes das senhas
    const senhaAdmin = await bcrypt.hash('admin123', 10);
    const senhaGestor = await bcrypt.hash('gestor123', 10);
    const senhaUsuario = await bcrypt.hash('usuario123', 10);
    const senhaGestor2 = await bcrypt.hash('dev123', 10);
    const senhaUsuario2 = await bcrypt.hash('teste123', 10);

    await queryInterface.bulkInsert('0060_Usuarios', [
      {
        usu_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        usu_email: 'admin@siteoni.com.br',
        usu_nome: 'Administrador',
        usu_senha: senhaAdmin,
        usu_telefone: '11999999999',
        usu_status: 'ativo',
        usu_tipo: 'admin',
        usu_parceiro_id: null,
        usu_ultimo_acesso: new Date(),
        usu_tentativas_login: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usu_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        usu_email: 'gestor@siteoni.com.br',
        usu_nome: 'Gestor Sistema',
        usu_senha: senhaGestor,
        usu_telefone: '11988888888',
        usu_status: 'ativo',
        usu_tipo: 'gestor',
        usu_parceiro_id: parceiroId,
        usu_ultimo_acesso: new Date(),
        usu_tentativas_login: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usu_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        usu_email: 'usuario@siteoni.com.br',
        usu_nome: 'Usuário Padrão',
        usu_senha: senhaUsuario,
        usu_telefone: '11987654321',
        usu_status: 'ativo',
        usu_tipo: 'usuario',
        usu_parceiro_id: parceiroId,
        usu_ultimo_acesso: new Date(),
        usu_tentativas_login: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usu_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d482',
        usu_email: 'dev@siteoni.com.br',
        usu_nome: 'Desenvolvedor',
        usu_senha: senhaGestor2,
        usu_telefone: '11986543210',
        usu_status: 'ativo',
        usu_tipo: 'gestor',
        usu_parceiro_id: parceiroId,
        usu_ultimo_acesso: new Date(),
        usu_tentativas_login: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usu_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d483',
        usu_email: 'teste@siteoni.com.br',
        usu_nome: 'Usuário Teste',
        usu_senha: senhaUsuario2,
        usu_telefone: '11985555555',
        usu_status: 'ativo',
        usu_tipo: 'usuario',
        usu_parceiro_id: parceiroId,
        usu_ultimo_acesso: new Date(),
        usu_tentativas_login: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('0060_Usuarios', {});
  },
};
