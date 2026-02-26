/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const parceiros = [
      {
        par_id: '550e8400-e29b-41d4-a716-446655440001',
        par_nome: 'Oni Telecom',
        par_dominio: 'http://localhost:3000',
        par_cidade: 'João Pessoa',
        par_estado: 'PB',
        par_endereco: 'Av. Epitácio Pessoa, 1000, Tambaú',
        par_cep: '58040-140',
        par_latitude: -7.115556,
        par_longitude: -34.878056,
        par_raio_cobertura: 50,
        par_status: 'ativo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        par_id: '550e8400-e29b-41d4-a716-446655440002',
        par_nome: 'Internet Mais',
        par_dominio: 'http://localhost:3001',
        par_cidade: 'Campina Grande',
        par_estado: 'PB',
        par_endereco: 'Rua Maciel Pinheiro, 500, Centro',
        par_cep: '58100-160',
        par_latitude: -7.229444,
        par_longitude: -35.881111,
        par_raio_cobertura: 45,
        par_status: 'ativo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        par_id: '550e8400-e29b-41d4-a716-446655440003',
        par_nome: 'Oline Net',
        par_dominio: 'http://localhost:3002',
        par_cidade: 'Recife',
        par_estado: 'PE',
        par_endereco: 'Av. Getúlio Vargas, 800, Boa Viagem',
        par_cep: '51020-000',
        par_latitude: -8.047556,
        par_longitude: -34.877000,
        par_raio_cobertura: 60,
        par_status: 'ativo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        par_id: '550e8400-e29b-41d4-a716-446655440004',
        par_nome: 'Wil Telecom',
        par_dominio: 'http://localhost:3003',
        par_cidade: 'Maceió',
        par_estado: 'AL',
        par_endereco: 'Av. Comendador Lyra, 1200, Pajuçara',
        par_cep: '57010-100',
        par_latitude: -9.655833,
        par_longitude: -35.735278,
        par_raio_cobertura: 40,
        par_status: 'ativo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('0001_Parceiro', parceiros);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('0001_Parceiro', null, {});
  },
};
