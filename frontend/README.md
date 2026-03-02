# 🌐 OniTelecom - Plataforma White-Label de Telecomunicações

Plataforma white-label desenvolvida em React para sites institucionais de telecomunicações, com sistema completo de multi-tenancy, controle de componentes e montagem dinâmica de páginas.

## 📋 Sobre o Projeto

O OniTelecom é uma plataforma moderna e altamente configurável que permite criar sites institucionais personalizados para diferentes parceiros/clientes de telecomunicações. O sistema oferece:

### ✨ Recursos Principais
- **Sistema White-Label Completo** - Branding totalmente customizável por parceiro
- **Multi-Tenancy** - Múltiplos parceiros com temas e conteúdos independentes
- **Montagem Dinâmica de Páginas** - Sistema PageBuilder para criar páginas por configuração
- **Controle de Componentes** - Ative/desative componentes e elementos por página
- **Temas por Parceiro** - Cores, logos, textos e conteúdos personalizáveis
- **Detecção Automática** - Via subdomínio, ENV ou localStorage
- Visualização de planos de internet e telefonia
- Ofertas de chips e pacotes
- Serviços para empresas
- Montagem de planos personalizados
- Sistema de carrinho de compras
- Seção de entretenimento
- FAQ e suporte

## 📚 Documentação Completa

Este projeto possui documentação detalhada em arquivos separados:

### 🎨 Sistema de Branding (White-Label)
- **[SISTEMA_BRANDING.md](docs/SISTEMA_BRANDING.md)** - Documentação completa do sistema white-label
- **[COMO_USAR_BRANDING.md](docs/COMO_USAR_BRANDING.md)** - Guia rápido para criar e usar parceiros

### 🏗️ Arquitetura e Componentes
- **[MONTAGEM_PAGINAS.md](docs/MONTAGEM_PAGINAS.md)** - Sistema de montagem dinâmica de páginas
- **[CONTROLE_COMPONENTES.md](docs/CONTROLE_COMPONENTES.md)** - Sistema de controle de visibilidade de componentes

### 📖 Como Usar a Documentação
1. **Iniciante?** Comece pelo [COMO_USAR_BRANDING.md](docs/COMO_USAR_BRANDING.md)
2. **Criar Parceiros?** Veja [SISTEMA_BRANDING.md](docs/SISTEMA_BRANDING.md)
3. **Criar Páginas?** Consulte [MONTAGEM_PAGINAS.md](docs/MONTAGEM_PAGINAS.md)
4. **Controlar Componentes?** Leia [CONTROLE_COMPONENTES.md](docs/CONTROLE_COMPONENTES.md)

## 🚀 Tecnologias Utilizadas

### Frontend
- **React** 18.2.0 - Biblioteca JavaScript para interfaces
- **React Router DOM** 6.4.2 - Roteamento SPA
- **Bootstrap** 5.3.5 - Framework CSS responsivo
- **Axios** 0.27.2 - Cliente HTTP
- **Font Awesome** - Ícones
- **React Icons** - Biblioteca de ícones
- **Animate.css** - Animações CSS
- **React Input Mask** - Máscaras de input

### Utilitários
- **jsPDF** - Geração de PDFs
- **jsPDF AutoTable** - Tabelas em PDF
- **File Saver** - Download de arquivos
- **XLSX** - Manipulação de planilhas Excel

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **Nginx** - Servidor web de produção

## 📁 Estrutura do Projeto

```
Onitelecom_site/
├── 📄 README.md                       # Este arquivo
├── docs/                              # 📚 Documentação completa
│   ├── SISTEMA_BRANDING.md            # Sistema white-label completo
│   ├── COMO_USAR_BRANDING.md          # Guia rápido de branding
│   ├── MONTAGEM_PAGINAS.md            # Sistema PageBuilder
│   └── CONTROLE_COMPONENTES.md        # Controle de componentes
├── public/
│   └── index.html                     # Template HTML
├── src/
│   ├── App.jsx                        # Componente principal e rotas
│   ├── index.jsx                      # Ponto de entrada React
│   ├── global.css                     # Estilos globais
│   ├── componentes/
│   │   ├── comuns/                    # Componentes reutilizáveis
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Banner.jsx
│   │   │   └── ... (25+ componentes)
│   │   ├── PageBuilder/               # 🆕 Sistema de montagem de páginas
│   │   │   └── PageBuilder.jsx
│   │   ├── ParceiroBranding/          # 🆕 Seletor de parceiros
│   │   │   ├── ParceiroBranding.jsx
│   │   │   └── ParceiroBranding.module.css
│   │   ├── css/                       # Estilos dos componentes
│   │   ├── Loading/                   # Componente de carregamento
│   │   ├── personalizados/            # Componentes customizados
│   │   ├── ProtectedRoute/            # Proteção de rotas
│   │   └── PublicRoute/               # Rotas públicas
│   ├── data/                          # 🆕 Sistema de configuração
│   │   ├── index.js                   # Exporta config ativa
│   │   ├── config.js                  # Config padrão + funções
│   │   ├── colors.js                  # Paleta de cores
│   │   ├── texts.js                   # Textos do site
│   │   ├── content.js                 # Conteúdo dinâmico
│   │   ├── images.js                  # URLs de imagens
│   │   ├── links.js                   # Links e rotas
│   │   ├── variables.css              # CSS Variables
│   │   └── parceiros/                 # 🆕 Configurações de parceiros
│   │       ├── index.js               # Exporta parceiros
│   │       ├── brandingManager.js     # Gerenciador de branding
│   │       └── telecomplus.js         # Exemplo: Telecom Plus
│   ├── hooks/                         # 🆕 React Hooks customizados
│   │   └── useBranding.js             # Hook de branding
│   ├── imagens/                       # Assets e imagens
│   ├── paginas/                       # Páginas da aplicação
│   │   ├── Inicio/
│   │   │   ├── Inicio.jsx             # Página original
│   │   │   ├── InicioV2.jsx           # 🆕 Com PageBuilder
│   │   │   └── ...
│   │   ├── autenticacao/              # Sistema de login/registro
│   │   └── email/                     # Confirmação de email
│   └── servicos/
│       ├── api.js                     # Configuração Axios
│       └── autenticacao.js            # Serviços de autenticação
├── docker-compose.yml                 # Configuração Docker Compose
├── Dockerfile                         # Build multi-stage
├── nginx.conf                         # Configuração Nginx
└── package.json                       # Dependências e scripts
```

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Docker e Docker Compose (para deploy)

### Desenvolvimento Local

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd Onitelecom_site
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o parceiro (opcional)**
```bash
# Crie um arquivo .env na raiz do projeto
REACT_APP_PARTNER=telecomplus  # onitelecom (padrão) ou telecomplus
REACT_APP_API_URL=http://localhost:5000/api
```

4. **Execute em modo desenvolvimento**
```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

### Build de Produção

**Build com parceiro padrão (OniTelecom):**
```bash
npm run build
```

**Build para parceiro específico:**
```bash
REACT_APP_PARTNER=telecomplus npm run build
```

Os arquivos otimizados serão gerados na pasta `build/`

### 🐳 Deploy com Docker

**Desenvolvimento:**
```bash
docker-compose up -d
```

**Produção com parceiro específico:**
```bash
docker-compose build --build-arg REACT_APP_PARTNER=telecomplus
docker-compose up -d
```

## 🐳 Deploy com Docker

### Build e execução com Docker Compose

```bash
docker-compose up -d
```

A aplicação estará disponível em `http://localhost:6540`

### Build manual da imagem Docker

```bash
# Build da imagem
docker build -t onitelecom-site .

# Executar container
docker run -d -p 6540:80 --name onitelecom-site onitelecom-site
```

## 📄 Páginas Disponíveis

### Páginas Principais
| Rota | Descrição | White-Label |
|------|-----------|-------------|
| `/` | Página inicial | ✅ |
| `/Quemsomos` | Sobre a empresa | ✅ |
| `/Internet` | Serviços de internet | ✅ |
| `/OfertasChips` | Ofertas de chips | ✅ |
| `/Entretenimento` | Serviços de entretenimento | ✅ |
| `/Planos` | Planos disponíveis | ✅ |
| `/ParaEmpresas` | Soluções empresariais | ✅ |
| `/MonteSeuPlano` | Montagem de plano personalizado | ✅ |
| `/perguntasfrequentes` | FAQ | ✅ |
| `/carrinho` | Carrinho de compras | ✅ |

### Páginas Especiais
| Rota | Descrição |
|------|-----------|
| `/Login` | Login de usuários |
| `/branding-test` | Interface de teste de parceiros |

## 🎨 Características do Sistema

### White-Label & Multi-Tenancy
- ✅ **Branding Completo** - Cores, logos, textos por parceiro
- ✅ **Multi-Parceiro** - Suporte ilimitado de parceiros
- ✅ **Detecção Automática** - Via ENV, subdomínio ou localStorage
- ✅ **CSS Variables** - Temas dinâmicos em tempo real
- ✅ **Meta Tags Dinâmicas** - Title, description, favicon por parceiro

### Controle de Componentes
- ✅ **Visibilidade Configurável** - Ative/desative componentes por página
- ✅ **Controle de Elementos** - Controle granular de elementos dentro de componentes
- ✅ **Configuração por JSON** - Sem código, apenas configuração

### Sistema de Páginas
- ✅ **PageBuilder** - Monte páginas dinamicamente
- ✅ **Componentes Reutilizáveis** - 25+ componentes disponíveis
- ✅ **Props Customizáveis** - Personalize comportamento de cada componente
- ✅ **Rotas Dinâmicas** - Geração automática de rotas

### Interface & UX
- ✅ Design responsivo (mobile-first)
- ✅ Carrossel de banners com imagens adaptativas
- ✅ Sistema de carrinho de compras
- ✅ Geração de PDFs
- ✅ Exportação para Excel
- ✅ Máscaras de input para formulários
- ✅ Animações suaves
- ✅ Otimizado para SEO
- ✅ Cache configurado para produção

## 🚀 Recursos Avançados

### Sistema de Branding
```javascript
// Trocar parceiro via código
import { switchParceiro } from './data/parceiros';
switchParceiro('telecomplus');

// Usar hook em componentes
import { useBranding } from './hooks/useBranding';
const { config, parceiroId } = useBranding();
```

### PageBuilder
```jsx
import PageBuilder from './componentes/PageBuilder/PageBuilder';

function MinhaPage() {
  return <PageBuilder pageName="inicio" />;
}
```

### Controle de Componentes
```javascript
import { shouldShowComponent } from './data/config';

if (shouldShowComponent('inicio', 'banner')) {
  // Renderizar banner
}
```

## 🔧 Scripts Disponíveis

```bash
npm start                              # Inicia servidor de desenvolvimento
npm run build                          # Build padrão (OniTelecom)
REACT_APP_PARTNER=telecomplus npm run build  # Build para parceiro
npm test                               # Executa testes
npm run eject                          # Ejeta configuração (não recomendado)
```

## 🎯 Guia Rápido por Funcionalidade

### Criar Novo Parceiro
1. Copie `src/data/parceiros/telecomplus.js` como modelo
2. Customize: ID, nome, cores, logos
3. Registre em `src/data/parceiros/brandingManager.js`
4. Teste com `localStorage.setItem('activeParceiro', 'seuparceiro')`

📖 **Documentação Completa**: [COMO_USAR_BRANDING.md](docs/COMO_USAR_BRANDING.md)

### Criar Nova Página
1. Configure em `src/data/config.js` → `config.pages`
2. Use PageBuilder: `<PageBuilder pageName="suapagina" />`
3. Adicione componentes desejados ao array

📖 **Documentação Completa**: [MONTAGEM_PAGINAS.md](docs/MONTAGEM_PAGINAS.md)

### Controlar Componentes
1. Edite `src/data/config.js` → `config.components`
2. Defina visibilidade por página
3. Use `shouldShowComponent(page, component)`

📖 **Documentação Completa**: [CONTROLE_COMPONENTES.md](docs/CONTROLE_COMPONENTES.md)

## 🌐 Deploy Multi-Parceiro

### Opção 1: Via Subdomínio
```nginx
# telecomplus.seusite.com.br → Telecom Plus
# onitelecom.seusite.com.br → OniTelecom
```

### Opção 2: Via Variável de Ambiente
```bash
# Build separado para cada parceiro
REACT_APP_PARTNER=onitelecom npm run build
REACT_APP_PARTNER=telecomplus npm run build
```

### Opção 3: Via localStorage (Desenvolvimento)
```javascript
localStorage.setItem('activeParceiro', 'telecomplus');
window.location.reload();
```

## 🌐 Configuração de Rede

O projeto está configurado para funcionar na rede Docker `softvirtus-network_softvirtus_net`, permitindo comunicação com outros serviços do ecossistema SoftVirtus.

## 📦 Build Multi-Stage

O Dockerfile utiliza build multi-stage para otimizar o tamanho da imagem:
1. **Stage 1**: Build da aplicação React com Node.js
2. **Stage 2**: Servir conteúdo estático com Nginx Alpine

Tamanho final da imagem: ~25MB

## ⚙️ Nginx

Configuração personalizada do Nginx inclui:
- ✅ Suporte a Single Page Application (SPA)
- ✅ Headers de cache para otimização
- ✅ Redirecionamento para index.html em rotas não encontradas
- ✅ Compressão gzip habilitada
- ✅ Headers de segurança

## 📊 Parceiros Disponíveis

### OniTelecom (Padrão)
- **ID**: `onitelecom`
- **Cor**: Roxo (#6B00FF)
- **Localização**: João Pessoa - PB
- **Status**: Configuração padrão

### Telecom Plus (Exemplo)
- **ID**: `telecomplus`
- **Cor**: Laranja (#FF6B00)
- **Localização**: São Paulo - SP
- **Status**: Exemplo de white-label

📖 **Como criar mais parceiros**: [SISTEMA_BRANDING.md](docs/SISTEMA_BRANDING.md)

## 🔐 Métodos de Ativação de Parceiro

1. **Variável de Ambiente** (Produção)
   ```bash
   REACT_APP_PARTNER=telecomplus npm start
   ```

2. **Subdomínio** (Multi-tenant)
   ```
   telecomplus.seusite.com.br
   ```

3. **localStorage** (Desenvolvimento)
   ```javascript
   localStorage.setItem('activeParceiro', 'telecomplus');
   ```

4. **Padrão** (Fallback)
   ```
   onitelecom (se nenhum método for detectado)
   ```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovoRecurso`)
3. Commit suas mudanças (`git commit -m 'Adiciona novo recurso'`)
4. Push para a branch (`git push origin feature/NovoRecurso`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte técnico ou dúvidas:
- 📧 Email: dev@onitelecom.com.br
- 📱 WhatsApp: (83) 97601-0064
- 🌐 Site: https://onitelecom.com.br

## 🔗 Links Úteis

- [Documentação do Sistema de Branding](docs/SISTEMA_BRANDING.md)
- [Guia de Uso Rápido do Branding](docs/COMO_USAR_BRANDING.md)
- [Sistema de Montagem de Páginas](docs/MONTAGEM_PAGINAS.md)
- [Controle de Componentes](docs/CONTROLE_COMPONENTES.md)

## 📝 Licença

Este projeto é privado e proprietário da OniTelecom.

## 👥 Autores

Desenvolvido pela equipe de desenvolvimento da OniTelecom

---

**💡 Dica**: Para começar rapidamente, leia primeiro o [COMO_USAR_BRANDING.md](docs/COMO_USAR_BRANDING.md) e depois explore as outras documentações conforme necessário.
