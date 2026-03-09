/**
 * @file Índice de Serviços
 * @description Arquivo de referência para documentação.
 * Os serviços são importados individualmente onde necessários:
 * - auth.js: autService (autenticação)
 * - api.js: api (cliente HTTP)
 * - base.js: criarServicoGenerico (factory)
 * - parceiros.js: ParceirosService (gerenciamento de parceiros)
 * - componentes.js: ComponentesService (gerenciamento de componentes)
 * - elementos.js: ElementosService (gerenciamento de elementos)
 * - imagens.js: ImagensService (gerenciamento de imagens)
 * - links.js: LinksService (gerenciamento de links)
 * - textos.js: TextosService (gerenciamento de textos)
 * - conteudo.js: ConteudoService (gerenciamento de conteúdo)
 * - cores.js: CoresService (gerenciamento de cores)
 * - features.js: FeaturesService (gerenciamento de features)
 * - temas.js: TemasService (gerenciamento de temas)
 * - permissoes.js: PermissoesService (gerenciamento de permissões)
 * - rolePermissoes.js: RolePermissoesService (gerenciamento de permissões de função)
 * - viacep.js: {buscarPorCep, buscarCoordenadas} (localização)
 *
 * @module servicos/index
 *
 * @example
 * // Importar serviço específico conforme necessário
 * import authService from './auth';
 * import ParceirosService from './parceiros';
 * import ComponentesService from './componentes';
 * import ElementosService from './elementos';
 * import ImagensService from './imagens';
 * import LinksService from './links';
 * import TextosService from './textos';
 * import ConteudoService from './conteudo';
 * import CoresService from './cores';
 * import FeaturesService from './features';
 * import TemasService from './temas';
 * import { buscarPorCep } from './viacep';
 */

// Os serviços são importados diretamente onde necessários
