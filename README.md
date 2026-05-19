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
│   │   │   ├── Ranking/        # Ranking de jogadores
│   │   │   └── Profile/        # Perfil do usuário
│   │   ├── components/         # Componentes compartilhados (Navbar)
│   │   ├── contexts/           # AuthContext (gerenciamento de sessão)
│   │   ├── services/           # Cliente Axios (api.ts)
│   │   └── types/              # Tipos TypeScript compartilhados
│   └── .env.example
└── docs/
    ├── escopo.md               # Tema, stack e justificativas
    ├── casos-de-uso.md         # 18 casos de uso documentados
    └── casos-de-teste.md       # 17 casos de teste (preenchidos na Sprint 2/3)
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
| POST   | /api/reviews                  | Sim  | Criar avaliação                    |
| PUT    | /api/reviews/:id              | Sim  | Editar avaliação                   |
| DELETE | /api/reviews/:id              | Sim  | Excluir avaliação                  |
| GET    | /api/forum                    | Não  | Listar posts do fórum              |
| GET    | /api/forum/:id                | Não  | Ver post com comentários           |
| POST   | /api/forum                    | Sim  | Criar post                         |
| PUT    | /api/forum/:id                | Sim  | Editar post                        |
| DELETE | /api/forum/:id                | Sim  | Excluir post                       |
| POST   | /api/forum/:id/comments       | Sim  | Comentar em post                   |
| DELETE | /api/forum/comments/:id       | Sim  | Excluir comentário                 |
| GET    | /api/ranking                  | Não  | Ranking de jogadores               |
| GET    | /api/users/me                 | Sim  | Ver meu perfil                     |
| PUT    | /api/users/me                 | Sim  | Atualizar meu perfil               |

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

## Documentação

- [Escopo e Stack](docs/escopo.md)
- [Casos de Uso](docs/casos-de-uso.md) — 18 casos de uso completos
- [Casos de Teste](docs/casos-de-teste.md) — 17 casos de teste

## Equipe

| Nome    | Função |
|---------|--------|
| Pedro   | Full-stack / Documentação |
| Yuri    | Back-end / Banco de Dados |
| Douglas | Front-end |
| João    | Back-end / Integrações |
