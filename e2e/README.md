# Testes E2E — GameLog (Playwright)

Suíte de testes end-to-end que simula a jornada real do usuário no navegador.

## Pré-requisitos

1. Backend rodando em `http://localhost:3000`:
   ```bash
   cd backend && npm run dev
   ```
2. Frontend rodando em `http://localhost:5173`:
   ```bash
   cd frontend && npm run dev
   ```
3. Banco PostgreSQL acessível com a `DATABASE_URL` do backend.
4. `RAWG_API_KEY` configurada (CT-16 depende da busca real na RAWG).

## Instalação

```bash
cd e2e
npm install
npx playwright install --with-deps chromium
```

## Execução

```bash
# Rodar todos os specs (modo headless)
npx playwright test

# Com UI interativa para debug
npx playwright test --ui

# Apenas um spec
npx playwright test tests/ct16-onboarding.spec.ts

# Abrir relatório HTML após execução
npx playwright show-report ../playwright-report
```

## Testes Cobertos

| Spec | Caso de Teste | Caso(s) de Uso |
|---|---|---|
| `ct16-onboarding.spec.ts` | CT-16 | UC01, UC04, UC06, UC07, UC26 |
| `ct17-forum.spec.ts` | CT-17 | UC01, UC12, UC15, UC26 |

## Estratégia de cleanup

Cada teste cria um usuário descartável (email com timestamp) e ao final chama
`DELETE /api/users/me`, que via cascade do Prisma remove todas as entidades
relacionadas (UserGame, ForumPost, PostComment, Review, Quiz, UserQuizResult).
Isso dispensa reset de banco entre execuções.
