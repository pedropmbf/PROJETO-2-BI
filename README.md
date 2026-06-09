# GameLog

Plataforma web para jogadores rastrearem sua biblioteca de jogos, competirem em rankings e participarem de um fórum de discussão.

## Tecnologias

| Camada     | Stack                                      |
|------------|--------------------------------------------|
| Front-end  | React 18 + Vite + TypeScript               |
| Back-end   | Node.js + Express + TypeScript             |
| Banco      | PostgreSQL + Prisma ORM                    |
| API externa| RAWG.io (catálogo de jogos)               |

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [PostgreSQL](https://www.postgresql.org/) v14 ou superior rodando localmente (ou via Docker)
- Chave gratuita da RAWG API: https://rawg.io/apidocs (cadastro grátis)

## Instalação e Execução

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd gamelog
```

### 2. Configurar o Back-end

```bash
cd backend

# Instalar dependências
npm install

# Copiar e preencher as variáveis de ambiente
cp .env.example .env
```

Edite o arquivo `backend/.env`:

```env
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/gamelog"
JWT_SECRET="qualquer_string_secreta_aleatoria"
RAWG_API_KEY="sua_chave_da_rawg_api"
PORT=3000
```

> Para obter a chave RAWG: acesse https://rawg.io/apidocs → Create an account → Get API key

```bash
# Criar o banco de dados e rodar as migrations
npx prisma migrate dev --name init

# Iniciar o servidor de desenvolvimento
npm run dev
```

O backend estará disponível em `http://localhost:3000`.  
Teste: `GET http://localhost:3000/health` deve retornar `{ "status": "ok" }`.

### 3. Configurar o Front-end

```bash
# Em outro terminal, a partir da raiz do projeto
cd frontend

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env
```

O arquivo `frontend/.env` por padrão aponta para o backend local:
```env
VITE_API_URL=http://localhost:3000
```

```bash
# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

## Estrutura do Projeto

```
gamelog/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Modelagem do banco de dados
│   ├── src/
│   │   ├── routes/             # Rotas da API REST
│   │   ├── middlewares/        # Autenticação JWT
│   │   ├── lib/                # Cliente Prisma
│   │   ├── app.ts              # Configuração do Express
│   │   └── server.ts           # Entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/              # Telas da aplicação
│   │   │   ├── Auth/           # Login e Cadastro
│   │   │   ├── Explore/        # Busca de jogos via RAWG
│   │   │   ├── Library/        # Biblioteca do usuário
│   │   │   ├── Reviews/        # Avaliações
│   │   │   ├── Forum/          # Fórum e posts
|   |   |   ├── Quiz/           # Quiz
│   │   │   ├── Lists/          # Listas de jogos do usuário
│   │   │   ├── News/           # Notícias (blog)
│   │   │   ├── Achievements/   # Conquistas
│   │   │   ├── Admin/          # Painel administrativo
│   │   │   ├── Ranking/        # Ranking de jogadores
│   │   │   └── Profile/        # Perfil do usuário
│   │   ├── components/         # Componentes compartilhados (Navbar, AdminRoute)
│   │   ├── contexts/           # AuthContext (gerenciamento de sessão)
│   │   ├── services/           # Cliente Axios (api.ts)
│   │   └── types/              # Tipos TypeScript compartilhados
│   └── .env.example
├── e2e/
│   ├── playwright.config.ts    # Configuração Playwright
│   ├── tests/
│   │   ├── ct16-onboarding.spec.ts
│   │   └── ct17-forum.spec.ts
│   └── README.md
└── docs/
    ├── escopo.md               # Tema, stack e justificativas
    ├── casos-de-uso.md         # 26 casos de uso documentados
    └── casos-de-teste.md       # 23 casos de teste (todos Aprovados na Sprint 3)
```

## Rotas da API

| Método | Rota                          | Auth | Descrição                          |
|--------|-------------------------------|------|------------------------------------|
| GET    | /health                       | Não  | Health check                       |
| POST   | /api/auth/register            | Não  | Cadastrar usuário                  |
| POST   | /api/auth/login               | Não  | Fazer login                        |
| GET    | /api/games/search?q=          | Não  | Buscar jogos (RAWG)                |
| GET    | /api/games/:rawgId            | Não  | Detalhes de um jogo (RAWG)         |
| GET    | /api/library                  | Sim  | Listar minha biblioteca            |
| POST   | /api/library                  | Sim  | Adicionar jogo à biblioteca        |
| PUT    | /api/library/:id              | Sim  | Atualizar status do jogo           |
| DELETE | /api/library/:id              | Sim  | Remover jogo da biblioteca         |
| GET    | /api/reviews/game/:rawgId     | Não  | Avaliações de um jogo              |
| GET    | /api/reviews/mine             | Sim  | Listar minhas avaliações           |
| POST   | /api/reviews                  | Sim  | Criar avaliação                    |
| PUT    | /api/reviews/:id              | Sim  | Editar avaliação                   |
| DELETE | /api/reviews/:id              | Sim  | Excluir avaliação                  |
| GET    | /api/forum                    | Não  | Listar posts do fórum              |
| GET    | /api/forum/:id                | Não  | Ver post com comentários           |
| POST   | /api/forum                    | Sim  | Criar post                         |
| PUT    | /api/forum/:id                | Sim  | Editar post                        |
| DELETE | /api/forum/:id                | Sim  | Excluir post                       |
| POST   | /api/forum/:id/comments       | Sim  | Comentar em post                   |
| PUT    | /api/forum/comments/:id       | Sim  | Editar comentário próprio          |
| DELETE | /api/forum/comments/:id       | Sim  | Excluir comentário                 |
| GET    | /api/ranking                  | Não  | Ranking de jogadores               |
| GET    | /api/users/me                 | Sim  | Ver meu perfil                     |
| PUT    | /api/users/me                 | Sim  | Atualizar meu perfil               |
| DELETE | /api/users/me                 | Sim  | Excluir minha conta (cascade)      |
| GET    | /api/quizzes                  | Não  | Listar quizzes (oficiais + comunidade) |
| GET    | /api/quizzes/:id              | Não  | Detalhes do quiz (sem correctIndex) |
| GET    | /api/quizzes/:id/edit         | Sim  | Quiz completo para edição (dono only) |
| GET    | /api/quizzes/:id/ranking      | Não  | Ranking de um quiz                 |
| POST   | /api/quizzes                  | Sim  | Criar quiz personalizado           |
| PUT    | /api/quizzes/:id              | Sim  | Editar quiz próprio                |
| DELETE | /api/quizzes/:id              | Sim  | Excluir quiz próprio               |
| POST   | /api/quizzes/:id/submit       | Sim  | Submeter respostas (upsert score)  |
| GET    | /api/lists                    | Não  | Listar listas públicas de jogos    |
| GET    | /api/lists/mine               | Sim  | Minhas listas                      |
| GET    | /api/lists/:id                | Não  | Detalhe de uma lista pública       |
| POST   | /api/lists                    | Sim  | Criar lista                        |
| PUT    | /api/lists/:id                | Sim  | Editar lista própria               |
| DELETE | /api/lists/:id                | Sim  | Excluir lista própria              |
| POST   | /api/lists/:id/items          | Sim  | Adicionar jogo à lista             |
| DELETE | /api/lists/:id/items/:itemId  | Sim  | Remover jogo da lista              |
| GET    | /api/news                     | Não  | Listar notícias publicadas         |
| GET    | /api/news/:id                 | Não  | Ver notícia                        |
| GET    | /api/news/admin/all           | Admin| Listar todas (inclui rascunhos)    |
| POST   | /api/news                     | Admin| Criar notícia                      |
| PUT    | /api/news/:id                 | Admin| Editar notícia                     |
| DELETE | /api/news/:id                 | Admin| Excluir notícia                    |
| GET    | /api/achievements             | Não  | Listar conquistas                  |
| GET    | /api/achievements/mine        | Sim  | Minhas conquistas (com status)     |
| POST   | /api/achievements             | Admin| Criar conquista                    |
| PUT    | /api/achievements/:id         | Admin| Editar conquista                   |
| DELETE | /api/achievements/:id         | Admin| Excluir conquista                  |
| GET    | /api/admin/stats              | Admin| Contagens para o painel            |
| GET    | /api/admin/users              | Admin| Listar usuários                    |
| PATCH  | /api/admin/users/:id/role     | Admin| Alterar papel (USER/ADMIN)         |
| DELETE | /api/admin/users/:id          | Admin| Excluir usuário                    |

> **Admin** = requer autenticação **e** papel `ADMIN` (campo `role` no usuário). Veja
> como promover um usuário em [docs/ambiente-setup.md](docs/ambiente-setup.md).

## Comandos Úteis

```bash
# Backend
npm run dev          # Servidor de desenvolvimento (hot-reload)
npm run build        # Compilar TypeScript
npm start            # Rodar build de produção
npx prisma studio    # Interface visual do banco de dados
npx prisma migrate dev --name <nome>  # Criar nova migration

# Frontend
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
```

## Testes e Qualidade

O projeto adota a estratégia exigida pela rubric: testes nos três níveis (unitário, integração, E2E), cobertura ≥ 70% e análise estática.

### Stack de testes

| Nível | Ferramenta | Local |
|---|---|---|
| Unitário | Vitest | `backend/src/tests/unit/` |
| Integração | Vitest + Supertest (mocks de Prisma e axios) | `backend/src/tests/integration/` |
| E2E | Playwright (Chromium) | `e2e/tests/` |
| Análise estática | ESLint + plugin `sonarjs` (complexidade, code smells, duplicação, vulnerabilidades) | `backend/eslint.config.mjs` + `frontend/eslint.config.js` |

### Executar a suíte completa

```bash
# 1) Unitários + Integração + Cobertura (backend)
cd backend
npm run test:coverage
# Gera: coverage/index.html, coverage/lcov.info, test-report/index.html, test-report/results.json
# Meta: lines >= 70% (atualmente ~89%)

# 2) E2E (com backend e frontend rodando em outros terminais)
cd backend && npm run dev          # terminal 1
cd frontend && npm run dev         # terminal 2
cd e2e
npm install
npx playwright install --with-deps chromium    # primeira vez
npx playwright test                            # roda CT-16 e CT-17
npx playwright show-report ../playwright-report

# 3) Análise estática (ESLint + sonarjs) — gera relatório HTML local
cd backend
npm run lint           # mostra issues no terminal
npm run lint:report    # gera backend/eslint-report.html
```

### Relatórios gerados

| Relatório | Caminho | Conteúdo |
|---|---|---|
| Vitest HTML | `backend/test-report/index.html` | Cada describe/it com tempo e status |
| Vitest JSON | `backend/test-report/results.json` | Resultado serializado (CI) |
| Coverage v8 HTML | `backend/coverage/index.html` | Coloração linha-a-linha por arquivo |
| Playwright HTML | `playwright-report/index.html` | Vídeo/screenshot/trace por teste |
| ESLint HTML | `backend/eslint-report.html` | Code smells, complexidade, duplicação (regras `sonarjs`) |

### Cobertura atual (após sprint 3)

```
File              | % Stmts | % Branch | % Funcs | % Lines |
------------------|---------|----------|---------|---------|
All files         |   89.18 |    89.39 |   98.76 |   88.83 |
 middlewares      |   94.11 |   100.00 |  100.00 |   94.11 |
 routes           |   89.25 |    89.70 |   98.57 |   88.25 |
 utils            |   86.36 |    86.53 |  100.00 |   96.55 |
```

> Meta de linhas ≥ 70% superada com folga (**88,83%**). Todos os CRUDs (biblioteca, avaliações,
> fórum, quiz, listas, notícias, conquistas) e a área admin têm testes dos caminhos principais
> e dos fluxos de erro (401/403/404/409/400).

179 testes verdes em 15 arquivos (21 unitários + 158 integração) + 2 specs E2E.

## Documentação

- [Requisitos (Requirements)](docs/requisitos.md) — pré-requisitos, versões e variáveis de ambiente
- [Ambiente e Execução](docs/ambiente-setup.md) — guia passo a passo para rodar em outro PC + cheat-sheet de comandos
- [Escopo e Stack](docs/escopo.md)
- [Casos de Uso](docs/casos-de-uso.md) — **36 casos de uso** completos (UC01–UC36)
- [Casos de Teste](docs/casos-de-teste.md) — **36 casos de teste** (CT-01–CT-36) com 100% aprovação
- [E2E (Playwright) README](e2e/README.md) — instruções para reproduzir CT-16 e CT-17

## Equipe

| Nome    | Função |
|---------|--------|
| Pedro   | Full-stack / Documentação |
| Yuri    | Back-end / Banco de Dados |
| Douglas | Front-end |
| João    | Back-end / Integrações |
