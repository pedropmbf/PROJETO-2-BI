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

---

## CT-24 — Criar lista de jogos válida

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-24 |
| **Caso de Uso**    | UC27  |
| **Objetivo**       | Verificar criação de lista com título válido |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Usuário autenticado |
| **Dados de Entrada** | `{ title: "Top RPGs", isPublic: true }` + Bearer token |
| **Passos**         | 1. POST `/api/lists`; 2. POST sem título (`"   "`) → 400; 3. POST sem token → 401 |
| **Resultado Esperado** | HTTP 201 com a lista criada; 400 título vazio; 401 sem token |
| **Resultado Obtido** | HTTP 201 `{ title: "Top RPGs", ... }`; 400 título vazio; 401 sem token. Testes em `lists.routes.test.ts` passaram. |
| **Status**         | Aprovado |

---

## CT-25 — Editar lista de outro usuário

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-25 |
| **Caso de Uso**    | UC28  |
| **Objetivo**       | Verificar bloqueio de edição por quem não é dono |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Lista pertencente a outro usuário |
| **Dados de Entrada** | PUT `/api/lists/1` com `{ title: "Nova" }` + Bearer token de usuário diferente |
| **Passos**         | 1. PUT na rota com dono diferente do solicitante |
| **Resultado Esperado** | HTTP 403 "Sem permissão" |
| **Resultado Obtido** | HTTP 403. Teste em `lists.routes.test.ts` passou. |
| **Status**         | Aprovado |

---

## CT-26 — Adicionar e remover jogo da lista

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-26 |
| **Caso de Uso**    | UC27, UC29 |
| **Objetivo**       | Verificar inclusão de item na lista própria e exclusão da lista |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Lista pertencente ao usuário autenticado |
| **Dados de Entrada** | POST `/api/lists/1/items` `{ rawgId: 3498, title: "GTA V" }`; DELETE `/api/lists/1` |
| **Passos**         | 1. POST item na lista própria; 2. DELETE da lista própria |
| **Resultado Esperado** | HTTP 201 com o item; HTTP 204 ao excluir |
| **Resultado Obtido** | HTTP 201 `{ rawgId: 3498, ... }`; HTTP 204 na exclusão. Testes em `lists.routes.test.ts` passaram. |
| **Status**         | Aprovado |

---

## CT-27 — Listar notícias publicadas

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-27 |
| **Caso de Uso**    | UC31  |
| **Objetivo**       | Verificar listagem pública apenas de notícias publicadas |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Ao menos uma notícia publicada |
| **Dados de Entrada** | GET `/api/news` |
| **Passos**         | 1. Requisição GET sem autenticação |
| **Resultado Esperado** | HTTP 200, array de notícias publicadas |
| **Resultado Obtido** | HTTP 200 com 1 notícia. Teste em `news.routes.test.ts` passou. |
| **Status**         | Aprovado |

---

## CT-28 — Criar notícia sem ser admin

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-28 |
| **Caso de Uso**    | UC32  |
| **Objetivo**       | Verificar bloqueio de escrita para usuário comum e ausência de token |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Usuário comum autenticado (`role = USER`) |
| **Dados de Entrada** | POST `/api/news` `{ title: "X", content: "Y" }` |
| **Passos**         | 1. POST sem token → 401; 2. POST com token de usuário comum → 403 |
| **Resultado Esperado** | HTTP 401 sem token; HTTP 403 "Acesso restrito a administradores" |
| **Resultado Obtido** | HTTP 401 e HTTP 403 conforme esperado. Testes em `news.routes.test.ts` passaram. |
| **Status**         | Aprovado |

---

## CT-29 — Criar notícia como admin

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-29 |
| **Caso de Uso**    | UC32  |
| **Objetivo**       | Verificar criação e validação de notícia por administrador |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Usuário autenticado com `role = ADMIN` |
| **Dados de Entrada** | `{ title: "Novidade", content: "Conteúdo", published: true }` + Bearer token admin |
| **Passos**         | 1. POST `/api/news` válido; 2. POST com conteúdo vazio → 400 |
| **Resultado Esperado** | HTTP 201 com a notícia; HTTP 400 conteúdo vazio |
| **Resultado Obtido** | HTTP 201 `{ title: "Novidade" }`; HTTP 400 conteúdo vazio. Testes em `news.routes.test.ts` passaram. |
| **Status**         | Aprovado |

---

## CT-30 — Middleware requireAdmin

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-30 |
| **Caso de Uso**    | UC36  |
| **Objetivo**       | Verificar o controle de acesso por papel |
| **Tipo**           | Unitário (middleware) |
| **Pré-condições**  | Nenhuma |
| **Dados de Entrada** | `req.userId` de usuário ADMIN, USER e inexistente |
| **Passos**         | 1. `requireAdmin` com usuário ADMIN; 2. com usuário USER; 3. com usuário inexistente |
| **Resultado Esperado** | ADMIN → `next()` chamado; USER → 403; inexistente → 403 |
| **Resultado Obtido** | ADMIN chama `next()` sem `status`; USER e inexistente retornam 403. 3 testes em `admin.middleware.test.ts` passaram. |
| **Status**         | Aprovado |

---

## CT-31 — Listar e marcar conquistas do usuário

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-31 |
| **Caso de Uso**    | UC33  |
| **Objetivo**       | Verificar status de desbloqueio das conquistas do usuário |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Usuário autenticado com ao menos 1 conquista desbloqueada |
| **Dados de Entrada** | GET `/api/achievements/mine` + Bearer token |
| **Passos**         | 1. GET sem token → 401; 2. GET com token e conquista desbloqueada |
| **Resultado Esperado** | HTTP 401 sem token; HTTP 200 com `unlocked: true` na conquista desbloqueada |
| **Resultado Obtido** | HTTP 401 sem token; HTTP 200 com `unlocked: true`. Testes em `achievements.routes.test.ts` passaram. |
| **Status**         | Aprovado |

---

## CT-32 — Criar conquista (admin) com validação

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-32 |
| **Caso de Uso**    | UC34  |
| **Objetivo**       | Verificar criação e validação de conquista pelo admin |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Usuário com `role = ADMIN`; usuário comum para o caso negativo |
| **Dados de Entrada** | `{ code: "FIRST_LIST", title: "Colecionador", description: "..." }`; código inválido `"codigo invalido"` |
| **Passos**         | 1. POST como usuário comum → 403; 2. POST válido como admin → 201; 3. POST com código inválido → 400 |
| **Resultado Esperado** | 403 usuário comum; 201 criação válida; 400 código inválido |
| **Resultado Obtido** | 403, 201 e 400 conforme esperado. Testes em `achievements.routes.test.ts` passaram. |
| **Status**         | Aprovado |

---

## CT-33 — Admin lista usuários

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-33 |
| **Caso de Uso**    | UC35  |
| **Objetivo**       | Verificar listagem de usuários restrita ao admin |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Admin autenticado; usuário comum para o caso negativo |
| **Dados de Entrada** | GET `/api/admin/users` |
| **Passos**         | 1. GET sem token → 401; 2. GET como usuário comum → 403; 3. GET como admin → 200 |
| **Resultado Esperado** | 401 sem token; 403 usuário comum; 200 com array de usuários |
| **Resultado Obtido** | 401, 403 e 200 (1 usuário) conforme esperado. Testes em `admin.routes.test.ts` passaram. |
| **Status**         | Aprovado |

---

## CT-34 — Admin altera papel de usuário

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-34 |
| **Caso de Uso**    | UC35  |
| **Objetivo**       | Verificar promoção/rebaixamento e bloqueio de auto-alteração |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Admin autenticado (id 1) |
| **Dados de Entrada** | PATCH `/api/admin/users/2/role` `{ role: "ADMIN" }`; PATCH `/api/admin/users/1/role` |
| **Passos**         | 1. PATCH papel de outro usuário; 2. PATCH do próprio papel |
| **Resultado Esperado** | HTTP 200 com novo papel; HTTP 400 ao tentar alterar o próprio |
| **Resultado Obtido** | HTTP 200 `{ role: "ADMIN" }`; HTTP 400 no auto-alteração. Testes em `admin.routes.test.ts` passaram. |
| **Status**         | Aprovado |

---

## CT-35 — Admin exclui usuário

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-35 |
| **Caso de Uso**    | UC35  |
| **Objetivo**       | Verificar exclusão de outro usuário pelo admin (com cascade) |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Admin autenticado; usuário alvo existente (id 2) |
| **Dados de Entrada** | DELETE `/api/admin/users/2` + Bearer token admin |
| **Passos**         | 1. DELETE na rota |
| **Resultado Esperado** | HTTP 204 sem body |
| **Resultado Obtido** | HTTP 204. Teste em `admin.routes.test.ts` passou. |
| **Status**         | Aprovado |

---

## CT-36 — Painel admin: estatísticas

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-36 |
| **Caso de Uso**    | UC36  |
| **Objetivo**       | Verificar retorno das contagens do painel para o admin |
| **Tipo**           | Integração (API) |
| **Pré-condições**  | Admin autenticado |
| **Dados de Entrada** | GET `/api/admin/stats` |
| **Passos**         | 1. GET com token admin |
| **Resultado Esperado** | HTTP 200 com `{ users, quizzes, lists, news, achievements }` |
| **Resultado Obtido** | HTTP 200 com `users: 3` (e demais contagens). Teste em `admin.routes.test.ts` passou. |
| **Status**         | Aprovado |
