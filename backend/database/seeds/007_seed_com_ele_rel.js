/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const relacionamentos = [
      // ==================== COMPONENTE: HEADER (6 elementos) ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500001',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470001', // Componente: header
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480001', // Elemento: topBar
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500002',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470001', // Componente: header
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480002', // Elemento: logo
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500003',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470001', // Componente: header
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480003', // Elemento: navigation
        cer_ordem: 3,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500004',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470001', // Componente: header
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480004', // Elemento: searchBar
        cer_ordem: 4,
        cer_habilitado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500005',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470001', // Componente: header
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480005', // Elemento: loginButton
        cer_ordem: 5,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: FOOTER (7 elementos) ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500008',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470002', // Componente: footer
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480002', // Elemento: logo
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500009',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470002', // Componente: footer
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480009', // Elemento: socialMedia
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500010',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470002', // Componente: footer
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480010', // Elemento: locationSelector
        cer_ordem: 3,
        cer_habilitado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500011',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470002', // Componente: footer
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480011', // Elemento: companyInfo
        cer_ordem: 4,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500012',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470002', // Componente: footer
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480012', // Elemento: columns
        cer_ordem: 5,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500013',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470002', // Componente: footer
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480013', // Elemento: appLinks
        cer_ordem: 6,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500014',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470002', // Componente: footer
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480014', // Elemento: copyright
        cer_ordem: 7,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: CAROUSEL ====================
      // Sem elementos específicos (apenas renderiza dinamicamente)

      // ==================== COMPONENTE: OFERTAS (7 elementos) ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500015',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470004', // Componente: ofertas
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480015', // Elemento: headline
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500016',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470004', // Componente: ofertas
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480016', // Elemento: toggleAll
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500017',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470004', // Componente: ofertas
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480017', // Elemento: navigationButtons
        cer_ordem: 3,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500018',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470004', // Componente: ofertas
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480018', // Elemento: seal
        cer_ordem: 4,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500019',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470004', // Componente: ofertas
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480019', // Elemento: benefits
        cer_ordem: 5,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500020',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470004', // Componente: ofertas
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480020', // Elemento: pricing
        cer_ordem: 6,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500021',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470004', // Componente: ofertas
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480021', // Elemento: contractButton
        cer_ordem: 7,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: FAQ (3 elementos) ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500022',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470005', // Componente: faq
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480032', // Elemento: search
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500023',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470005', // Componente: faq
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480033', // Elemento: categories
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500024',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470005', // Componente: faq
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480034', // Elemento: accordion
        cer_ordem: 3,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: HELP SECTION (3 elementos) ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500025',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470006', // Componente: helpSection
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480022', // Elemento: title
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500026',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470006', // Componente: helpSection
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480023', // Elemento: description
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500027',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470006', // Componente: helpSection
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480031', // Elemento: backgroundImage
        cer_ordem: 3,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500100',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470006', // Componente: helpSection
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480035', // Elemento: buttons
        cer_ordem: 4,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: BANNER ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500028',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470007', // Componente: banner
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480022', // Elemento: title
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500029',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470007', // Componente: banner
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480023', // Elemento: description
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500030',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470007', // Componente: banner
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480031', // Elemento: backgroundImage
        cer_ordem: 3,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: DEPOIMENTOS ====================
      // Sem elementos específicos (renderiza conteúdo dinâmico)

      // ==================== COMPONENTE: CONTATO (5 elementos) ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500031',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470009', // Componente: contato
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480026', // Elemento: form
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500032',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470009', // Componente: contato
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480027', // Elemento: map
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500033',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470009', // Componente: contato
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480028', // Elemento: phones
        cer_ordem: 3,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500034',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470009', // Componente: contato
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480029', // Elemento: email
        cer_ordem: 4,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500035',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470009', // Componente: contato
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480030', // Elemento: address
        cer_ordem: 5,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: FAIXA PLANOS (3 elementos) ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500036',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470010', // Componente: faixaPlanos
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480022', // Elemento: title
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500037',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470010', // Componente: faixaPlanos
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480020', // Elemento: pricing
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500038',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470010', // Componente: faixaPlanos
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480021', // Elemento: contractButton
        cer_ordem: 3,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: SERVIÇOS ESSENCIAIS (4 elementos) ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500039',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470011', // Componente: servicosEssenciais
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480022', // Elemento: title
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500040',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470011', // Componente: servicosEssenciais
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480023', // Elemento: description
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500041',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470011', // Componente: servicosEssenciais
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480024', // Elemento: cards
        cer_ordem: 3,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500042',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470011', // Componente: servicosEssenciais
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480025', // Elemento: icons
        cer_ordem: 4,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: SERVIÇOS ESSENCIAIS INTERNET (4 elementos) ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500043',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470012', // Componente: servicosEssenciaisInternet
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480022', // Elemento: title
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500044',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470012', // Componente: servicosEssenciaisInternet
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480023', // Elemento: description
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500045',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470012', // Componente: servicosEssenciaisInternet
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480024', // Elemento: cards
        cer_ordem: 3,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500046',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470012', // Componente: servicosEssenciaisInternet
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480025', // Elemento: icons
        cer_ordem: 4,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: INFINITE POSSIBILITIES ====================
      // Sem elementos específicos (renderiza conteúdo dinâmico)

      // ==================== COMPONENTE: APP EXCLUSIVO ====================
      // Sem elementos específicos (apenas imagens e links)

      // ==================== COMPONENTE: PLANO CONTROLE ====================
      // Sem elementos específicos (renderiza dinâmico)

      // ==================== COMPONENTE: TELEFONIA BANNER ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500047',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470016', // Componente: telefoniaBanner
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480022', // Elemento: title
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500048',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470016', // Componente: telefoniaBanner
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480031', // Elemento: backgroundImage
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: POR QUE ESCOLHER ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500049',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470017', // Componente: porQueEscolher
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480022', // Elemento: title
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500050',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470017', // Componente: porQueEscolher
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480024', // Elemento: cards
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: INTRODUÇÃO ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500051',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470018', // Componente: introducao
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480022', // Elemento: title
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500052',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470018', // Componente: introducao
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480023', // Elemento: description
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: SERVIÇOS ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500053',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470019', // Componente: servicos
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480022', // Elemento: title
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500054',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470019', // Componente: servicos
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480024', // Elemento: cards
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500055',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470019', // Componente: servicos
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480025', // Elemento: icons
        cer_ordem: 3,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: DIVISOR SEÇÃO ====================
      // Sem elementos específicos (apenas divisor)

      // ==================== COMPONENTE: CARDS ENTRETENIMENTO ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500056',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470021', // Componente: cardsEntretenimento
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480022', // Elemento: title
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500057',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470021', // Componente: cardsEntretenimento
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480024', // Elemento: cards
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: QUEM SOMOS ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500058',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470022', // Componente: quemsomos
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480022', // Elemento: title
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500059',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470022', // Componente: quemsomos
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480023', // Elemento: description
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ==================== COMPONENTE: OFERTAS CHIPS ====================
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500060',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470023', // Componente: ofertaschips
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480022', // Elemento: title
        cer_ordem: 1,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cer_id: '550e8400-e29b-41d4-a716-446655500061',
        cer_com_id: '550e8400-e29b-41d4-a716-446655470023', // Componente: ofertaschips
        cer_ele_id: '550e8400-e29b-41d4-a716-446655480024', // Elemento: cards
        cer_ordem: 2,
        cer_habilitado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('0007_Com_Ele_Rel', relacionamentos);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('0007_Com_Ele_Rel', null, {});
  },
};
