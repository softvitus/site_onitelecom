/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const temas = [
      {
        tem_id: '550e8400-e29b-41d4-a716-446655450001',
        tem_par_id: '550e8400-e29b-41d4-a716-446655440001',
        tem_nome: 'Tema Principal - Oni Telecom',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tem_id: '550e8400-e29b-41d4-a716-446655450002',
        tem_par_id: '550e8400-e29b-41d4-a716-446655440002',
        tem_nome: 'Tema Principal - Internet Mais',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tem_id: '550e8400-e29b-41d4-a716-446655450003',
        tem_par_id: '550e8400-e29b-41d4-a716-446655440003',
        tem_nome: 'Tema Principal - Oline Net',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tem_id: '550e8400-e29b-41d4-a716-446655450004',
        tem_par_id: '550e8400-e29b-41d4-a716-446655440004',
        tem_nome: 'Tema Principal - Wil Telecom',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('0002_Tema', temas);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('0002_Tema', null, {});
  },
};
