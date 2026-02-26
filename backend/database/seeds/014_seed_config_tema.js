/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const configTema = [
      {
        cfg_id: '550e8400-e29b-41d4-a716-446655570001',
        cfg_tem_id: '550e8400-e29b-41d4-a716-446655450001', // Tema: Telecom Plus - Padrão
        cfg_chave: 'fonte_principal',
        cfg_valor: 'Arial, sans-serif',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cfg_id: '550e8400-e29b-41d4-a716-446655570002',
        cfg_tem_id: '550e8400-e29b-41d4-a716-446655450001',
        cfg_chave: 'tamanho_fonte_base',
        cfg_valor: '16px',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cfg_id: '550e8400-e29b-41d4-a716-446655570003',
        cfg_tem_id: '550e8400-e29b-41d4-a716-446655450001',
        cfg_chave: 'largura_maxima',
        cfg_valor: '1200px',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cfg_id: '550e8400-e29b-41d4-a716-446655570004',
        cfg_tem_id: '550e8400-e29b-41d4-a716-446655450001',
        cfg_chave: 'espacamento_padrao',
        cfg_valor: '16px',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cfg_id: '550e8400-e29b-41d4-a716-446655570005',
        cfg_tem_id: '550e8400-e29b-41d4-a716-446655450002', // Tema: Telecom Plus - Escuro
        cfg_chave: 'fonte_principal',
        cfg_valor: 'Helvetica, sans-serif',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cfg_id: '550e8400-e29b-41d4-a716-446655570006',
        cfg_tem_id: '550e8400-e29b-41d4-a716-446655450002',
        cfg_chave: 'modo_escuro',
        cfg_valor: 'true',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cfg_id: '550e8400-e29b-41d4-a716-446655570007',
        cfg_tem_id: '550e8400-e29b-41d4-a716-446655450003', // Tema: Internet Brasil
        cfg_chave: 'fonte_principal',
        cfg_valor: 'Georgia, serif',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cfg_id: '550e8400-e29b-41d4-a716-446655570008',
        cfg_tem_id: '550e8400-e29b-41d4-a716-446655450003',
        cfg_chave: 'raio_botoes',
        cfg_valor: '8px',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cfg_id: '550e8400-e29b-41d4-a716-446655570009',
        cfg_tem_id: '550e8400-e29b-41d4-a716-446655450004', // Tema: Conecta Net
        cfg_chave: 'fonte_principal',
        cfg_valor: 'Verdana, sans-serif',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cfg_id: '550e8400-e29b-41d4-a716-446655570010',
        cfg_tem_id: '550e8400-e29b-41d4-a716-446655450004',
        cfg_chave: 'animacoes_ativas',
        cfg_valor: 'true',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('0014_Config_Tema', configTema);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('0014_Config_Tema', null, {});
  },
};
