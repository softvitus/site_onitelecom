/**
 * Seeder de Imagens - V2 Otimizado
 *
 * Varre automaticamente os diretórios de imagens locais
 * Converte imagens para Base64 para armazenamento no banco
 * Otimiza PNGs convertendo para WebP (reduz ~60% de tamanho)
 *
 * Diretórios suportados:
 * - backend/imagens/App_Exclusivo
 * - backend/imagens/Entretenimento
 * - backend/imagens/Help_Section
 * - backend/imagens/img_SoftVirtus
 * - backend/imagens/Infinite_Possibilities
 * - backend/imagens/Logos
 * - backend/imagens/Ofertas
 * - backend/imagens/Ofertas_chips
 * - backend/imagens/Plano_Controle
 * - backend/imagens/Quem_somos
 * - backend/imagens/Servicos_Essenciais
 * - backend/imagens/Servicos_Essenciais_Internet
 * - backend/imagens/Telefonia_Banner
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretórios de imagens do backend
const IMAGENS_DIR = path.join(__dirname, '../../imagens');

// Extensões permitidas
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

// Mapeamento de categorias por diretório
const CATEGORY_MAP = {
  Logos: 'logos',
  Ofertas: 'oferta',
  Ofertas_chips: 'chip',
  App_Exclusivo: 'appExclusivo',
  Entretenimento: 'entretenimento',
  Help_Section: 'help',
  Servicos_Essenciais: 'servicosEssenciais',
  Servicos_Essenciais_Internet: 'servicosEssenciaisInternet',
  Plano_Controle: 'planoControle',
  Quem_somos: 'about',
  Infinite_Possibilities: 'infinitePossibilities',
  Telefonia_Banner: 'telefoniaBanner',
  img_SoftVirtus: 'brand',
  carrosel: 'carousel',
  icone: 'meta',
};

// Mapeamento de nomes de arquivos para nomes descritivos (por categoria)
const NAME_MAP = {
  servicosEssenciais: {
    img1: 'consultaFatura',
    img2: 'duvidas',
    img3: 'faleConosco',
    img4: 'recarga',
  },
  servicosEssenciaisInternet: {
    img1: 'fibraOptica',
    img2: 'roteadorWifi',
    img3: 'suporteTecnico',
    img4: 'equipeEspecializada',
  },
  appExclusivo: {
    Onigo: 'logo',
    Onigo_Telas: 'telas',
    img1: 'controles_play',
    img2: 'controles_pause',
    img3: 'controles_retroceder',
    img4: 'controles_avancar',
  },
  planoControle: {
    '5g': 'background5g',
    img1: 'chip',
    img2: 'smartphone',
  },
  telefoniaBanner: {
    img1: 'banner',
  },
  help: {
    img1: 'faq',
    img2: 'atendimento',
    img3: 'planos',
  },
  logos: {
    onitelecom: 'main',
    Oniheader: 'header',
  },
  meta: {
    Oni: 'favicon',
  },
};

/**
 * Converte TODAS as imagens para Base64 em formato WebP otimizado
 * SVGs mantêm formato original (não convertem para WebP)
 */
async function imageToBase64(imagePath, categoria) {
  try {
    if (!fs.existsSync(imagePath)) return null;

    const ext = path.extname(imagePath).toLowerCase();
    const nomeArquivo = path.basename(imagePath).toLowerCase();

    // SVG: manter formato original (não converte)
    if (ext === '.svg') {
      try {
        const buffer = fs.readFileSync(imagePath);
        const base64 = buffer.toString('base64');
        return `data:image/svg+xml;base64,${base64}`;
      } catch (error) {
        console.warn(`⚠️ Erro ao ler SVG ${imagePath}:`, error.message);
        return null;
      }
    }

    // TODAS outras extensões: converter para WebP com compressão otimizada
    try {
      // Configurações por tipo de imagem
      const isLogo =
        nomeArquivo.includes('logo') ||
        nomeArquivo.includes('header') ||
        nomeArquivo.includes('marca');
      const isCarousel =
        categoria === 'carousel' ||
        nomeArquivo.includes('slide') ||
        nomeArquivo.includes('banner');

      // Carrossel: alta qualidade, demais: compressão normal
      let maxWidth;
      let quality;

      if (isCarousel) {
        maxWidth = 1920; // Full HD para carrossel
        quality = 100; // Qualidade máxima
      } else if (isLogo) {
        maxWidth = 200; // Logos pequenas
        quality = 40;
      } else {
        maxWidth = 400; // Outras imagens
        quality = 40;
      }

      const buffer = await sharp(imagePath)
        .resize(maxWidth, maxWidth, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toBuffer();

      const base64 = buffer.toString('base64');
      return `data:image/webp;base64,${base64}`;
    } catch (error) {
      console.warn(
        `⚠️ Erro ao converter ${imagePath} para WebP:`,
        error.message,
      );

      // Fallback: usar formato original sem conversão
      try {
        const buffer = fs.readFileSync(imagePath);
        const base64 = buffer.toString('base64');

        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
        };

        const mimeType = mimeTypes[ext] || 'image/png';
        return `data:${mimeType};base64,${base64}`;
      } catch (fallbackError) {
        console.warn(
          `⚠️ Fallback falhou para ${imagePath}:`,
          fallbackError.message,
        );
        return null;
      }
    }
  } catch (error) {
    console.warn(`⚠️ Erro ao converter ${imagePath}:`, error.message);
    return null;
  }
}

/**
 * Varre um diretório e retorna imagens
 */
async function scanDirectory(dirPath, categoria) {
  const imagens = [];

  try {
    if (!fs.existsSync(dirPath)) return imagens;

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        const fullPath = path.join(dirPath, file);
        const base64 = await imageToBase64(fullPath, categoria);

        if (base64) {
          const originalName = path.basename(file, ext);
          // Usar nome descritivo se existir no mapeamento
          const finalName = NAME_MAP[categoria]?.[originalName] || originalName;

          imagens.push({
            img_id: uuidv4(),
            img_tem_id: '550e8400-e29b-41d4-a716-446655450001', // Tema padrão ONI
            img_categoria: categoria,
            img_nome: finalName,
            img_valor: base64,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ Erro ao varrer ${dirPath}:`, error.message);
  }

  return imagens;
}

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const imagens = [];

    // Varrer cada diretório e adicionar imagens
    for (const [dir, categoria] of Object.entries(CATEGORY_MAP)) {
      const dirPath = path.join(IMAGENS_DIR, dir);
      const imagensDir = await scanDirectory(dirPath, categoria);
      imagens.push(...imagensDir);
    }

    console.log(
      `✅ Seeder: ${imagens.length} imagens encontradas para inserir`,
    );

    if (imagens.length > 0) {
      await queryInterface.bulkInsert('0009_Imagens', imagens);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('0009_Imagens', null, {});
  },
};
