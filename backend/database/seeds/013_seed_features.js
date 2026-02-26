/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const features = [
      {
        fea_id: '550e8400-e29b-41d4-a716-446655560001',
        fea_tem_id: '550e8400-e29b-41d4-a716-446655450001', // Tema: Telecom Plus - Padrão
        fea_nome: 'suporte_chat',
        fea_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fea_id: '550e8400-e29b-41d4-a716-446655560002',
        fea_tem_id: '550e8400-e29b-41d4-a716-446655450001',
        fea_nome: 'contratar_online',
        fea_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fea_id: '550e8400-e29b-41d4-a716-446655560003',
        fea_tem_id: '550e8400-e29b-41d4-a716-446655450001',
        fea_nome: 'rastreamento_pedido',
        fea_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fea_id: '550e8400-e29b-41d4-a716-446655560004',
        fea_tem_id: '550e8400-e29b-41d4-a716-446655450001',
        fea_nome: 'promocoes_email',
        fea_habilitado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fea_id: '550e8400-e29b-41d4-a716-446655560005',
        fea_tem_id: '550e8400-e29b-41d4-a716-446655450002', // Tema: Telecom Plus - Escuro
        fea_nome: 'suporte_chat',
        fea_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fea_id: '550e8400-e29b-41d4-a716-446655560006',
        fea_tem_id: '550e8400-e29b-41d4-a716-446655450002',
        fea_nome: 'area_cliente',
        fea_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fea_id: '550e8400-e29b-41d4-a716-446655560007',
        fea_tem_id: '550e8400-e29b-41d4-a716-446655450003', // Tema: Internet Brasil
        fea_nome: 'suporte_whatsapp',
        fea_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fea_id: '550e8400-e29b-41d4-a716-446655560008',
        fea_tem_id: '550e8400-e29b-41d4-a716-446655450004', // Tema: Conecta Net
        fea_nome: 'contratar_online',
        fea_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('0013_Features', features);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('0013_Features', null, {});
  },
};
