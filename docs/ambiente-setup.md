# Ambiente e Execução — Guia para rodar em outro PC

Este guia leva do zero até a aplicação rodando, em qualquer máquina, sem conflito de
versões. O banco é o **Supabase (nuvem)**, então não há PostgreSQL/Docker local.

Pré-requisitos detalhados: [requisitos.md](requisitos.md).

---

## Visão geral

O repositório tem 3 pastas independentes, cada uma com seu próprio `package.json`:

```
backend/    → API Express + Prisma   (porta 3000)
frontend/   → React + Vite           (porta 5173)
e2e/        → Testes Playwright
```

O isolamento entre máquinas vem de **2 coisas**:
1. **Node fixado** pelo `.nvmrc` (`nvm use` seleciona a versão certa).
2. **`npm ci`**, que instala exatamente as versões do `package-lock.json` em `node_modules`
   (que já é isolado por pasta). Assim duas máquinas ficam idênticas.

---

## Passo a passo (primeira vez em um PC novo)

### 1. Clonar e selecionar o Node

```bash
git clone <URL_DO_REPOSITORIO>
cd PROJETO-2-BI
nvm install 22   # se ainda não tiver
nvm use          # lê o .nvmrc (Node 22)
```

### 2. Backend — instalar, configurar e preparar o banco

```bash
cd backend
npm ci                      # instala as versões travadas
copy .env.example .env      # Windows (PowerShell/CMD).  Linux/macOS: cp .env.example .env
```

Edite `backend/.env` preenchendo com os valores reais do seu Supabase e da RAWG:

```env
DATABASE_URL="postgresql://postgres.<ref>:<senha>@aws-...pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres:<senha>@db.<ref>.supabase.co:5432/postgres"
JWT_SECRET="uma_string_longa_e_aleatoria"
RAWG_API_KEY="sua_chave_rawg"
PORT=3000
```

Gere o Prisma Client, aplique as migrations e popule os dados iniciais:

```bash
npx prisma generate          # gera o client tipado
npx prisma migrate deploy    # aplica TODAS as migrations no banco
npm run db:seed              # admin oficial + quizzes + conquistas + notícia de exemplo
```

> `migrate deploy` é o comando para **aplicar** migrations existentes (ideal em outra
> máquina / produção). Use `npm run db:migrate` (= `prisma migrate dev`) só quando for
> **criar** uma migration nova após mudar o `schema.prisma`.

### 3. Frontend — instalar e configurar

```bash
cd ../frontend
npm ci
copy .env.example .env       # Linux/macOS: cp .env.example .env
# o padrão já aponta para http://localhost:3000
```

### 4. (Opcional) E2E

```bash
cd ../e2e
npm ci
npx playwright install --with-deps chromium
```

---

## Rodar a aplicação (dia a dia)

Abra **dois terminais**:

```bash
# Terminal 1 — backend
cd backend
npm run dev          # http://localhost:3000  (health: GET /health)
```

```bash
# Terminal 2 — frontend
cd frontend
npm run dev          # http://localhost:5173
```

Acesse `http://localhost:5173`.

**Conta admin de teste (do seed):** `admin@gamelog.com` / `admin123` — vê o menu **Admin**.

---

## Lista de comandos (cheat-sheet)

### Backend (`cd backend`)
```bash
npm ci                         # instalar deps (reprodutível)
npm run dev                    # servidor com hot-reload (nodemon + ts-node)
npm run build                  # compila TS -> dist/
npm start                      # roda o build de produção
npm test                       # testes (Vitest)  — 118 testes
npm run test:coverage          # testes + cobertura (coverage/index.html)
npm run lint                   # análise estática (ESLint + sonarjs)
npm run lint:report            # gera backend/eslint-report.html

npx prisma generate            # regenerar o client após mudar o schema
npx prisma migrate deploy      # aplicar migrations (PC novo / produção)
npm run db:migrate             # criar nova migration (= prisma migrate dev)
npm run db:seed                # popular dados iniciais
npx prisma studio              # UI do banco em http://localhost:5555
```

### Frontend (`cd frontend`)
```bash
npm ci                         # instalar deps
npm run dev                    # dev server (Vite, HMR)
npm run build                  # type-check + build de produção
npm run preview                # servir o build localmente
npm run lint                   # ESLint
```

### E2E (`cd e2e`, com backend e frontend no ar)
```bash
npx playwright test            # roda os specs
npx playwright test --ui       # modo interativo
npx playwright show-report ../playwright-report
```

---

## Promover um usuário a administrador

A área `/admin` exige `role = ADMIN`. Formas de conceder:

- **Pela própria interface:** logado como admin, vá em **Admin → Usuários** e clique em
  **Promover** no usuário desejado.
- **Pelo Prisma Studio:** `npx prisma studio` → tabela `User` → mude `role` para `ADMIN`.
- **Por SQL (Supabase):**
  ```sql
  UPDATE "User" SET role = 'ADMIN' WHERE email = 'fulano@email.com';
  ```

O usuário precisa **deslogar e logar de novo** para o menu Admin aparecer (o papel vai
no objeto de usuário guardado no login).

---

## Solução de problemas

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| `Cannot find dependency '@vitest/ui'` ao rodar testes | `node_modules` incompleto | `npm ci` (ou `npm install`) na pasta `backend`. |
| Erro de versão do Node no Vite | Node < 20.19 | `nvm use` (Node 22). |
| `prisma migrate` trava/erro de conexão | `DIRECT_URL` ausente/errada | Confira a string direta (porta 5432) no `.env`. |
| Busca de jogos vazia / 500 em `/api/games` | `RAWG_API_KEY` faltando | Preencha a chave no `backend/.env`. |
| Frontend não fala com a API | `VITE_API_URL` ou backend desligado | Suba o backend e cheque `frontend/.env`. |
| Menu **Admin** não aparece | usuário sem `role=ADMIN` ou sessão antiga | Promova o usuário e faça logout/login. |

---

## Segurança (importante)

- O arquivo `.env` está no `.gitignore` e **nunca** deve ser commitado.
- Como as credenciais de desenvolvimento já circularam, recomenda-se **rotacionar**
  o `JWT_SECRET` e a `RAWG_API_KEY`, e trocar a senha do banco no painel do Supabase.
