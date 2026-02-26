/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const relacionamentos = [
      // ==================== PÁGINA: INICIO ====================
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490001',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460001',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470001', // header
        pcr_ordem: 1,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490002',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460001',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470003', // carousel
        pcr_ordem: 2,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490003',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460001',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470011', // servicosEssenciais
        pcr_ordem: 3,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490004',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460001',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470004', // ofertas
        pcr_ordem: 4,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490005',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460001',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470012', // servicosEssenciaisInternet
        pcr_ordem: 5,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490006',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460001',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470009', // contato
        pcr_ordem: 6,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490007',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460001',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470013', // infinitePossibilities
        pcr_ordem: 7,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490008',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460001',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470014', // appExclusivo
        pcr_ordem: 8,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490009',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460001',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470015', // planoControle
        pcr_ordem: 9,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490010',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460001',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470016', // telefoniaBanner
        pcr_ordem: 10,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490011',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460001',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470006', // helpSection
        pcr_ordem: 11,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490012',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460001',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470002', // footer
        pcr_ordem: 12,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== PÁGINA: INTERNET ====================
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490013',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460002',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470001', // header
        pcr_ordem: 1,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490014',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460002',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470004', // ofertas
        pcr_ordem: 2,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490015',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460002',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470010', // faixaPlanos
        pcr_ordem: 3,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490016',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460002',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470012', // servicosEssenciaisInternet
        pcr_ordem: 4,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490017',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460002',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470013', // infinitePossibilities
        pcr_ordem: 5,
        pcr_habilitado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490018',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460002',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470006', // helpSection
        pcr_ordem: 6,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490019',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460002',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470002', // footer
        pcr_ordem: 7,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== PÁGINA: EMPRESAS ====================
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490020',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460003',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470001', // header
        pcr_ordem: 1,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490021',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460003',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470007', // banner
        pcr_ordem: 2,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490022',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460003',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470018', // introducao
        pcr_ordem: 3,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490023',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460003',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470019', // servicos
        pcr_ordem: 4,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490024',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460003',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470020', // divisorSecao
        pcr_ordem: 5,
        pcr_habilitado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490025',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460003',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470017', // porQueEscolher
        pcr_ordem: 6,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490026',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460003',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470008', // depoimentos
        pcr_ordem: 7,
        pcr_habilitado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490027',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460003',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470002', // footer
        pcr_ordem: 8,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== PÁGINA: ENTRETENIMENTO ====================
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490028',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460005',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470001', // header
        pcr_ordem: 1,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490029',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460005',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470021', // cardsEntretenimento
        pcr_ordem: 2,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490030',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460005',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470006', // helpSection
        pcr_ordem: 3,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490031',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460005',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470002', // footer
        pcr_ordem: 4,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== PÁGINA: PLANOS ====================
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490032',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460006',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470001', // header
        pcr_ordem: 1,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490033',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460006',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470002', // footer
        pcr_ordem: 2,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== PÁGINA: QUEM SOMOS ====================
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490034',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460007',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470001', // header
        pcr_ordem: 1,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490035',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460007',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470022', // quemsomos
        pcr_ordem: 2,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490036',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460007',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470009', // contato
        pcr_ordem: 3,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490037',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460007',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470013', // infinitePossibilities
        pcr_ordem: 4,
        pcr_habilitado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490038',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460007',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470002', // footer
        pcr_ordem: 5,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== PÁGINA: OFERTAS CHIPS ====================
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490039',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460008',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470001', // header
        pcr_ordem: 1,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490040',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460008',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470023', // ofertaschips
        pcr_ordem: 2,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490041',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460008',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470010', // faixaPlanos
        pcr_ordem: 3,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490042',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460008',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470013', // infinitePossibilities
        pcr_ordem: 4,
        pcr_habilitado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490043',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460008',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470006', // helpSection
        pcr_ordem: 5,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490044',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460008',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470002', // footer
        pcr_ordem: 6,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== PÁGINA: MONTE SEU PLANO ====================
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490045',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460009',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470001', // header
        pcr_ordem: 1,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490046',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460009',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470002', // footer
        pcr_ordem: 2,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== PÁGINA: FAQ ====================
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490047',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460010',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470001', // header
        pcr_ordem: 1,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490048',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460010',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470005', // faq
        pcr_ordem: 2,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490049',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460010',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470002', // footer
        pcr_ordem: 3,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== PÁGINA: LOGIN ====================
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490050',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460011',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470001', // header
        pcr_ordem: 1,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490051',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460011',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470002', // footer
        pcr_ordem: 2,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== PÁGINA: CARRINHO ====================
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490052',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460012',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470001', // header
        pcr_ordem: 1,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pcr_id: '550e8400-e29b-41d4-a716-446655490053',
        pcr_pag_id: '550e8400-e29b-41d4-a716-446655460012',
        pcr_com_id: '550e8400-e29b-41d4-a716-446655470002', // footer
        pcr_ordem: 2,
        pcr_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('0006_Pág_Com_Rel', relacionamentos);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('0006_Pág_Com_Rel', null, {});
  },
};
