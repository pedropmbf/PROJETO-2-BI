# Casos de Teste — GameLog

> **Status dos resultados:** Esta tabela será preenchida durante a Sprint 2 e Sprint 3, após implementação completa das suítes de teste.

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
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

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
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

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
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

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
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

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
| **Passos**         | 1. Requisição GET ao endpoint |
| **Resultado Esperado** | HTTP 200, `{ results: [...] }` com ao menos 1 item contendo rawgId, title, coverImage |
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

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
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

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
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

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
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

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
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

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
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

---

## CT-11 — Criar review com nota inválida

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-11 |
| **Caso de Uso**    | UC09  |
| **Objetivo**       | Verificar rejeição de nota fora do intervalo |
| **Tipo**           | Unitário (validação) |
| **Pré-condições**  | Usuário autenticado |
| **Dados de Entrada** | `{ rawgId: 5638, rating: 11, title: "Ótimo", content: "..." }` |
| **Passos**         | 1. POST `/api/reviews` |
| **Resultado Esperado** | HTTP 400, `{ "error": "rating deve ser entre 1 e 10" }` |
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

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
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

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
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

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
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

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
| **Passos**         | 1. Requisição sem token |
| **Resultado Esperado** | HTTP 401, `{ "error": "Token não fornecido" }` |
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

---

## CT-16 — Fluxo E2E: Registro → Explorar → Adicionar → Ver Biblioteca

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-16 |
| **Caso de Uso**    | UC01, UC04, UC06, UC07 |
| **Objetivo**       | Verificar o fluxo completo de onboarding do usuário |
| **Tipo**           | E2E (Playwright) |
| **Pré-condições**  | Sistema rodando, banco limpo |
| **Dados de Entrada** | Usuário novo: username "e2euser", email "e2e@test.com", senha "teste123" |
| **Passos**         | 1. Acessa `/register` e cria conta; 2. É redirecionado para `/explore`; 3. Busca "Zelda"; 4. Clica em "+ Biblioteca"; 5. Acessa `/library`; 6. Verifica que o jogo aparece com status "backlog"; 7. Muda status para "playing" |
| **Resultado Esperado** | Todos os passos executados sem erros, status atualizado visível na tela |
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |

---

## CT-17 — Fluxo E2E: Criar post e comentar

| Campo              | Valor |
|--------------------|-------|
| **ID**             | CT-17 |
| **Caso de Uso**    | UC12, UC15 |
| **Objetivo**       | Verificar fluxo completo de interação no fórum |
| **Tipo**           | E2E (Playwright) |
| **Pré-condições**  | Usuário autenticado |
| **Passos**         | 1. Acessa `/forum`; 2. Cria post; 3. Clica no post; 4. Adiciona comentário; 5. Verifica que comentário aparece |
| **Resultado Esperado** | Post e comentário visíveis sem reload completo |
| **Resultado Obtido** | *Pendente* |
| **Status**         | Pendente |
