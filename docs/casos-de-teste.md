# Casos de Teste — GameLog

## Padrão de Documentação

| Campo             | Descrição                                        |
|-------------------|--------------------------------------------------|
| ID                | Identificador único (CT-XX)                      |
| Caso de Uso       | UC referenciado                                  |
| Objetivo          | O que o teste valida                             |
| Tipo              | Unitário / Integração / E2E                      |
| Pré-condições     | Estado necessário antes de executar              |
| Dados de Entrada  | Valores utilizados no teste                      |
| Passos            | Ações executadas                                 |
| Resultado Esperado| O que o sistema deve retornar/fazer              |
| Resultado Obtido  | Preenchido na execução (Sprint 2/3)              |
| Status            | Aprovado / Reprovado / Pendente                  |

---

## CT-01 — Cadastro com dados válidos

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-01 |
| **Caso de Uso**    | UC01  |
| **Objetivo**       | Verificar que um novo usuário é criado com sucesso |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | E-mail e username não cadastrados |
| **Dados de Entrada** | `{ "username": "gamer01", "email": "gamer01@test.com", "password": "senha123" }` |
| **Passos**         | 1. POST `/api/auth/register` com os dados acima |
| **Resultado Esperado** | HTTP 201, body com `{ user: {...}, token: "..." }` |
| **Resultado Obtido** | HTTP 201, body `{ user: { id: 1, username: "gamer01", email: "gamer01@test.com", ... }, token: "fake-jwt-token" }` |
| **Status**         | Aprovado |

---

## CT-02 — Cadastro com e-mail duplicado

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-02 |
| **Caso de Uso**    | UC01  |
| **Objetivo**       | Verificar rejeição de e-mail já cadastrado |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Usuário com e-mail "gamer01@test.com" já cadastrado |
| **Dados de Entrada** | `{ "username": "outro", "email": "gamer01@test.com", "password": "senha123" }` |
| **Passos**         | 1. POST `/api/auth/register` |
| **Resultado Esperado** | HTTP 409, `{ "error": "Email ou username já em uso" }` |
| **Resultado Obtido** | HTTP 409, `{ "error": "Email ou username já em uso" }` |
| **Status**         | Aprovado |

---

## CT-03 — Login com credenciais válidas

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-03 |
| **Caso de Uso**    | UC02  |
| **Objetivo**       | Verificar autenticação bem-sucedida |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Usuário cadastrado com email/senha conhecidos |
| **Dados de Entrada** | `{ "email": "gamer01@test.com", "password": "senha123" }` |
| **Passos**         | 1. POST `/api/auth/login` |
| **Resultado Esperado** | HTTP 200, `{ user: {...}, token: "..." }` |
| **Resultado Obtido** | HTTP 200, `{ user: { id: 1, username: "gamer01", email: "gamer01@test.com" }, token: "fake-jwt-token" }` |
| **Status**         | Aprovado |

---

## CT-04 — Login com senha errada

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-04 |
| **Caso de Uso**    | UC02  |
| **Objetivo**       | Verificar rejeição de credenciais inválidas |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Usuário cadastrado |
| **Dados de Entrada** | `{ "email": "gamer01@test.com", "password": "senhaerrada" }` |
| **Passos**         | 1. POST `/api/auth/login` |
| **Resultado Esperado** | HTTP 401, `{ "error": "Credenciais inválidas" }` |
| **Resultado Obtido** | HTTP 401, `{ "error": "Credenciais inválidas" }` |
| **Status**         | Aprovado |

---

## CT-05 — Busca de jogos na RAWG API

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-05 |
| **Caso de Uso**    | UC04  |
| **Objetivo**       | Verificar integração com RAWG e retorno de resultados |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | `RAWG_API_KEY` configurada no `.env` |
| **Dados de Entrada** | `GET /api/games/search?q=zelda` |
| **Passos**         | 1. Requisição GET ao endpoint com servidor rodando |
| **Resultado Esperado** | HTTP 200, `{ results: [...] }` com ao menos 1 item contendo rawgId, title, coverImage |
| **Resultado Obtido** | HTTP 200, array de jogos retornado com rawgId, title, coverImage, genre e metacriticScore. Exemplo: `{ rawgId: 5638, title: "The Legend of Zelda: Breath of the Wild", ... }` |
| **Status**         | Aprovado |

---

## CT-06 — Adicionar jogo à biblioteca

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-06 |
| **Caso de Uso**    | UC06  |
| **Objetivo**       | Verificar criação de UserGame com status backlog |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Usuário autenticado, jogo não na biblioteca |
| **Dados de Entrada** | `{ rawgId: 5638, title: "The Legend of Zelda", status: "backlog" }` + Bearer token |
| **Passos**         | 1. POST `/api/library` com Authorization header |
| **Resultado Esperado** | HTTP 201, body com UserGame criado |
| **Resultado Obtido** | HTTP 201, `{ id: 1, userId: 1, gameId: 10, status: "backlog", game: { rawgId: 5638, title: "The Legend of Zelda", ... } }` |
| **Status**         | Aprovado |

---

## CT-07 — Adicionar jogo duplicado à biblioteca

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-07 |
| **Caso de Uso**    | UC06  |
| **Objetivo**       | Verificar rejeição de jogo já na biblioteca |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Jogo já na biblioteca do usuário |
| **Dados de Entrada** | Mesmo rawgId do CT-06 |
| **Passos**         | 1. POST `/api/library` novamente |
| **Resultado Esperado** | HTTP 409, `{ "error": "Jogo já está na sua biblioteca" }` |
| **Resultado Obtido** | HTTP 409, `{ "error": "Jogo já está na sua biblioteca" }` |
| **Status**         | Aprovado |

---

## CT-08 — Atualizar status do jogo

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-08 |
| **Caso de Uso**    | UC07  |
| **Objetivo**       | Verificar atualização de status de backlog para playing |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | UserGame com id conhecido, status "backlog" |
| **Dados de Entrada** | `{ "status": "playing" }` |
| **Passos**         | 1. PUT `/api/library/{id}` com Bearer token |
| **Resultado Esperado** | HTTP 200, UserGame com status "playing" |
| **Resultado Obtido** | HTTP 200, `{ id: 1, status: "playing", game: { rawgId: 5638, title: "The Legend of Zelda", ... } }` |
| **Status**         | Aprovado |

---

## CT-09 — Remover jogo da biblioteca

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-09 |
| **Caso de Uso**    | UC08  |
| **Objetivo**       | Verificar exclusão do UserGame |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | UserGame com id conhecido |
| **Dados de Entrada** | DELETE `/api/library/{id}` + Bearer token |
| **Passos**         | 1. DELETE na rota |
| **Resultado Esperado** | HTTP 204, sem body |
| **Resultado Obtido** | HTTP 204, body vazio |
| **Status**         | Aprovado |

---

## CT-10 — Criar avaliação válida

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-10 |
| **Caso de Uso**    | UC09  |
| **Objetivo**       | Verificar criação de review com dados válidos |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Jogo na base local, usuário autenticado, sem review anterior |
| **Dados de Entrada** | `{ rawgId: 5638, rating: 9, title: "Obra-prima", content: "Jogo incrível..." }` |
| **Passos**         | 1. POST `/api/reviews` com Bearer token |
| **Resultado Esperado** | HTTP 201, review criada |
| **Resultado Obtido** | Testado manualmente via servidor local. HTTP 201 retornado com review contendo id, userId, gameId, rating: 9, title e content. |
| **Status**         | Aprovado |

---

## CT-11 — Criar review com nota inválida

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-11 |
| **Caso de Uso**    | UC09  |
| **Objetivo**       | Verificar rejeição de nota fora do intervalo |
| **Tipo**           | Unitário (validação) |
| **Pré-condições**  | Nenhuma |
| **Dados de Entrada** | `rating = 11` e `rating = 0` |
| **Passos**         | 1. Chamar `validateRating(11)` e `validateRating(0)` |
| **Resultado Esperado** | Retorno `false` para ambos |
| **Resultado Obtido** | `validateRating(11)` → `false`; `validateRating(0)` → `false`; `validateRating(5)` → `true`. Teste automatizado passou. |
| **Status**         | Aprovado |

---

## CT-12 — Criar post no fórum

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-12 |
| **Caso de Uso**    | UC12  |
| **Objetivo**       | Verificar criação de post com dados válidos |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Usuário autenticado |
| **Dados de Entrada** | `{ title: "Melhor RPG de 2024?", content: "Qual foi o melhor RPG lançado em 2024?" }` |
| **Passos**         | 1. POST `/api/forum` com Bearer token |
| **Resultado Esperado** | HTTP 201, ForumPost criado |
| **Resultado Obtido** | Testado manualmente via servidor local. HTTP 201 retornado com id, userId, title, content e createdAt. |
| **Status**         | Aprovado |

---

## CT-13 — Comentar em post existente

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-13 |
| **Caso de Uso**    | UC15  |
| **Objetivo**       | Verificar criação de comentário |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Post existente com id conhecido, usuário autenticado |
| **Dados de Entrada** | `{ content: "Eu acho que foi Elden Ring!" }` |
| **Passos**         | 1. POST `/api/forum/{id}/comments` |
| **Resultado Esperado** | HTTP 201, PostComment criado |
| **Resultado Obtido** | Testado manualmente via servidor local. HTTP 201 retornado com id, postId, userId e content. |
| **Status**         | Aprovado |

---

## CT-14 — Visualizar ranking

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-14 |
| **Caso de Uso**    | UC17  |
| **Objetivo**       | Verificar retorno correto do ranking ordenado |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Ao menos 2 usuários com jogos completados |
| **Dados de Entrada** | GET `/api/ranking` |
| **Passos**         | 1. Requisição GET sem autenticação |
| **Resultado Esperado** | HTTP 200, array ordenado por completedGames decrescente |
| **Resultado Obtido** | Testado manualmente via servidor local. HTTP 200 retornado com array de usuários contendo position, username, completedGames e avgCompletion, ordenados corretamente. |
| **Status**         | Aprovado |

---

## CT-15 — Acesso a rota protegida sem token

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-15 |
| **Caso de Uso**    | UC06, UC09, UC12 |
| **Objetivo**       | Verificar proteção de rotas autenticadas |
| **Tipo**           | Unitário (middleware) |
| **Pré-condições**  | Nenhuma |
| **Dados de Entrada** | POST `/api/library` sem header Authorization |
| **Passos**         | 1. Chamar `authenticate(req, res, next)` com `req.headers = {}` |
| **Resultado Esperado** | HTTP 401, `{ "error": "Token não fornecido" }` |
| **Resultado Obtido** | `res.status` chamado com `401`; `res.json` chamado com `{ error: "Token não fornecido" }`; `next()` não foi chamado. Teste automatizado passou. |
| **Status**         | Aprovado |

---

## CT-16 — Fluxo E2E: Registro → Explorar → Adicionar → Ver Biblioteca

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-16 |
| **Caso de Uso**    | UC01, UC04, UC06, UC07, UC26 |
| **Objetivo**       | Verificar o fluxo completo de onboarding do usuário |
| **Tipo**           | E2E (Playwright) |
| **Pré-condições**  | Backend rodando em :3000, frontend em :5173, banco acessível, RAWG_API_KEY configurada |
| **Dados de Entrada** | Usuário novo com email/username timestampados (`e2e_${Date.now()}`) e senha "senha123" |
| **Passos**         | 1. Acessa `/register` e cria conta; 2. É redirecionado para `/explore`; 3. Busca "zelda"; 4. Clica em "+ Biblioteca" no primeiro resultado; 5. Acessa `/library`; 6. Valida que o select de status mostra "backlog"; 7. Muda para "playing"; 8. Reload e valida persistência; 9. Cleanup via `DELETE /api/users/me` (UC26) |
| **Resultado Esperado** | Todos os passos passam; usuário criado, jogo adicionado, status atualizado e persistido; cleanup com 204 |
| **Resultado Obtido** | Spec implementado em `e2e/tests/ct16-onboarding.spec.ts`. Execução via `npx playwright test`. Relatório HTML em `playwright-report/index.html`. |
| **Status**         | Aprovado |

---

## CT-17 — Fluxo E2E: Criar post e comentar

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-17 |
| **Caso de Uso**    | UC01, UC12, UC15, UC26 |
| **Objetivo**       | Verificar fluxo completo de interação no fórum |
| **Tipo**           | E2E (Playwright) |
| **Pré-condições**  | Backend rodando em :3000, frontend em :5173, banco acessível |
| **Dados de Entrada** | Usuário novo timestampado; post com título "Post E2E {timestamp}"; comentário "Comentário E2E {timestamp}" |
| **Passos**         | 1. Registra novo usuário; 2. Acessa `/forum`; 3. Clica "+ Novo Post"; 4. Preenche título e conteúdo, publica; 5. Verifica post na lista; 6. Abre o post; 7. Comenta; 8. Valida que aparece sem reload e que o contador vai para "Comentários (1)"; 9. Cleanup via `DELETE /api/users/me` (UC26) |
| **Resultado Esperado** | Post e comentário visíveis sem reload completo; cleanup com 204 |
| **Resultado Obtido** | Spec implementado em `e2e/tests/ct17-forum.spec.ts`. Execução via `npx playwright test`. Relatório HTML em `playwright-report/index.html`. |
| **Status**         | Aprovado |

---

## CT-18 — Listar quizzes disponíveis

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-18 |
| **Caso de Uso**    | UC19  |
| **Objetivo**       | Verificar listagem de quizzes com dados corretos |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Banco populado com seed (3 quizzes oficiais) |
| **Dados de Entrada** | GET `/api/quizzes` |
| **Passos**         | 1. Requisição GET sem autenticação |
| **Resultado Esperado** | HTTP 200, array com quizzes; oficiais aparecem primeiro |
| **Resultado Obtido** | HTTP 200, `[{ id: 1, title: "GTA V — Você é fã de verdade?", isOfficial: true, createdBy: { username: "admin" }, _count: { questions: 10, results: 0 } }]`. Quizzes oficiais listados antes dos criados por usuários. Teste automatizado passou. |
| **Status**         | Aprovado |

---

## CT-19 — Detalhes de quiz sem revelar resposta correta

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-19 |
| **Caso de Uso**    | UC20  |
| **Objetivo**       | Verificar que o campo `correctIndex` não é exposto ao cliente |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Quiz com id conhecido existente |
| **Dados de Entrada** | GET `/api/quizzes/1` |
| **Passos**         | 1. Requisição GET; 2. Inspecionar cada objeto de pergunta no body |
| **Resultado Esperado** | HTTP 200, perguntas sem o campo `correctIndex` |
| **Resultado Obtido** | HTTP 200, perguntas contendo apenas `id`, `text` e `options`. Campo `correctIndex` ausente do body. Teste automatizado passou. |
| **Status**         | Aprovado |

---

## CT-20 — Criar quiz com menos de 3 perguntas

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-20 |
| **Caso de Uso**    | UC22  |
| **Objetivo**       | Verificar rejeição de quiz com perguntas insuficientes |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Usuário autenticado |
| **Dados de Entrada** | `{ title: "Meu Quiz", questions: [ {P1}, {P2} ] }` + Bearer token |
| **Passos**         | 1. POST `/api/quizzes` com apenas 2 perguntas |
| **Resultado Esperado** | HTTP 400, `{ "error": "O quiz precisa de pelo menos 3 perguntas" }` |
| **Resultado Obtido** | HTTP 400, `{ "error": "O quiz precisa de pelo menos 3 perguntas" }`. Teste automatizado passou (assertion corrigida de `.toContain` para `.toBe` exato). |
| **Status**         | Aprovado |

---

## CT-21 — Editar quiz próprio

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-21 |
| **Caso de Uso**    | UC22  |
| **Objetivo**       | Verificar atualização de quiz próprio com substituição de perguntas em transação |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Quiz criado pelo usuário autenticado (não oficial) |
| **Dados de Entrada** | PUT `/api/quizzes/:id` com `{ title: "Quiz Editado", questions: [...3+ perguntas válidas] }` + Bearer token do dono |
| **Passos**         | 1. PUT na rota com payload válido; 2. Em paralelo: tentar editar quiz oficial → 403; 3. Tentar editar quiz de outro usuário → 403 |
| **Resultado Esperado** | HTTP 200 com quiz atualizado; HTTP 403 para oficial; HTTP 403 para não-dono; HTTP 404 para id inexistente |
| **Resultado Obtido** | HTTP 200 com `title: "Quiz Editado"`; 403 oficial `"Quizzes oficiais não podem ser editados"`; 403 não-dono `"Sem permissão"`; 404 inexistente. 4 testes automatizados passaram. |
| **Status**         | Aprovado |

---

## CT-22 — Editar comentário próprio

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-22 |
| **Caso de Uso**    | UC15  |
| **Objetivo**       | Verificar atualização de comentário próprio em post do fórum |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Comentário criado pelo usuário autenticado |
| **Dados de Entrada** | PUT `/api/forum/comments/:id` com `{ content: "Comentário editado" }` + Bearer token |
| **Passos**         | 1. PUT com content válido; 2. PUT com content vazio; 3. PUT em comentário de outro usuário; 4. PUT sem token |
| **Resultado Esperado** | HTTP 200 com comentário atualizado; 400 com content vazio; 404 para comentário alheio; 401 sem token |
| **Resultado Obtido** | HTTP 200 `{ content: "Comentário editado" }`; 400 conteúdo vazio; 404 `"Comentário não encontrado"`; 401 sem token. 4 testes automatizados passaram. |
| **Status**         | Aprovado |

---

## CT-23 — Excluir conta do usuário

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-23 |
| **Caso de Uso**    | UC18  |
| **Objetivo**       | Verificar exclusão de conta com cascade nas entidades relacionadas |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Usuário autenticado existente |
| **Dados de Entrada** | DELETE `/api/users/me` + Bearer token |
| **Passos**         | 1. DELETE na rota com token; 2. DELETE sem token |
| **Resultado Esperado** | HTTP 204 sem body; cascades configurados no schema removem userGames/reviews/posts/comments/quizzes/quizResults. HTTP 401 sem token. |
| **Resultado Obtido** | HTTP 204 sem body; `prisma.user.delete` chamado com `{ where: { id: USER_ID } }`. HTTP 401 sem token. 2 testes automatizados passaram. |
| **Status**         | Aprovado |
