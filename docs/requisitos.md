# Requisitos do Projeto (Requirements)

Lista do que é necessário para rodar o GameLog em qualquer máquina. As versões
**exatas** das bibliotecas npm ficam travadas nos arquivos `package-lock.json` de
cada pasta — por isso a instalação deve ser feita com **`npm ci`** (não `npm install`),
garantindo o mesmo ambiente em qualquer PC.

> Guia passo a passo de instalação: [ambiente-setup.md](ambiente-setup.md)

## 1. Software de sistema

| Ferramenta | Versão mínima | Observação |
|------------|---------------|------------|
| **Node.js** | **20.19+** (recomendado **22 LTS**) | Fixada em [`.nvmrc`](../.nvmrc) e no campo `engines` dos `package.json`. Exigida pelo Vite 8. |
| **npm** | 10+ | Vem junto com o Node 20/22. |
| **Git** | qualquer recente | Para clonar o repositório. |

Com [nvm](https://github.com/nvm-sh/nvm) (Linux/macOS) ou
[nvm-windows](https://github.com/coreybutler/nvm-windows):

```bash
nvm install 22
nvm use 22      # lê o .nvmrc na raiz
```

## 2. Contas e chaves externas

| Recurso | Para quê | Onde obter |
|---------|----------|------------|
| **Banco PostgreSQL (Supabase)** | Banco de dados da aplicação | https://supabase.com — crie um projeto gratuito e pegue as connection strings (Pooler `:6543` e Direct `:5432`). |
| **RAWG API Key** | Catálogo de jogos (busca/explorar) | https://rawg.io/apidocs — cadastro grátis. |

> O projeto usa Supabase (nuvem). Não é preciso instalar PostgreSQL localmente nem Docker.

## 3. Variáveis de ambiente

### `backend/.env` (copiar de `backend/.env.example`)

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `DATABASE_URL` | ✅ | Connection string do Supabase **com pooler** (porta 6543, `?pgbouncer=true`). Usada em runtime. |
| `DIRECT_URL` | ✅ | Connection string **direta** (porta 5432). Usada pelo Prisma para migrations. |
| `JWT_SECRET` | ✅ | Segredo para assinar/validar os tokens JWT. Use uma string longa e aleatória. |
| `RAWG_API_KEY` | ✅ | Chave da RAWG API. |
| `PORT` | ❌ | Porta do backend (padrão `3000`). |

### `frontend/.env` (copiar de `frontend/.env.example`)

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `VITE_API_URL` | ❌ | URL do backend. Padrão `http://localhost:3000`. |

## 4. Versões das principais dependências

Travadas nos `package-lock.json`; abaixo as de referência:

**Backend** — Express `^5.2.1`, Prisma / @prisma/client `^6.19.3`, jsonwebtoken `^9.0.3`,
bcryptjs `^3.0.3`, TypeScript `^6.0.3`, Vitest `^4.1.6`, Supertest `^7.2.2`, ts-node `^10.9.2`,
nodemon `^3.1.14`, ESLint `^10` + `eslint-plugin-sonarjs`.

**Frontend** — React / React-DOM `^19.2.6`, React Router `^7.15.0`, Axios `^1.16.0`,
Vite `^8.0.12`, TypeScript `~6.0.2`, ESLint `^10`.

**E2E** — Playwright `^1.60.0` (pasta `e2e/`).

## 5. Portas usadas

| Serviço | Porta |
|---------|-------|
| Backend (Express) | 3000 |
| Frontend (Vite) | 5173 |
| Prisma Studio | 5555 |
