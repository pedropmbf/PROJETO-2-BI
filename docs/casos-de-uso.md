# Casos de Uso — GameLog

## Padrão de Documentação

Cada caso de uso segue o padrão: **Ator, Pré-condições, Fluxo Principal, Fluxos Alternativos, Pós-condições**.

---

## UC01 — Cadastrar Usuário

**Ator:** Visitante  
**Pré-condições:** O usuário não possui conta cadastrada.

**Fluxo Principal:**
1. O visitante acessa a tela de cadastro (`/register`)
2. Preenche username, e-mail e senha (mínimo 6 caracteres)
3. Clica em "Criar Conta"
4. O sistema valida os dados e verifica unicidade de e-mail e username
5. O sistema cria a conta e autentica automaticamente o usuário
6. O usuário é redirecionado para a tela de Explorar

**Fluxos Alternativos:**
- 4a. E-mail já cadastrado → exibe mensagem "Email ou username já em uso"
- 4b. Senha com menos de 6 caracteres → validação HTML5 impede o envio

**Pós-condições:** Conta criada, usuário autenticado com JWT válido por 7 dias.

---

## UC02 — Fazer Login

**Ator:** Usuário cadastrado  
**Pré-condições:** O usuário possui conta ativa.

**Fluxo Principal:**
1. O usuário acessa `/login`
2. Informa e-mail e senha
3. Clica em "Entrar"
4. O sistema valida as credenciais
5. O sistema emite um token JWT e armazena no localStorage
6. O usuário é redirecionado para `/explore`

**Fluxos Alternativos:**
- 4a. Credenciais inválidas → exibe "Credenciais inválidas"
- 4b. Campos em branco → validação HTML5 impede o envio

**Pós-condições:** Usuário autenticado, token JWT armazenado no cliente.

---

## UC03 — Fazer Logout

**Ator:** Usuário autenticado  
**Pré-condições:** Usuário está logado.

**Fluxo Principal:**
1. O usuário clica em "Sair" na navbar
2. O sistema remove o token e dados do localStorage
3. O usuário é redirecionado para `/login`

**Fluxos Alternativos:** Nenhum.

**Pós-condições:** Sessão encerrada, rotas privadas inacessíveis.

---

## UC04 — Buscar Jogos por Nome

**Ator:** Qualquer usuário (autenticado ou não)  
**Pré-condições:** Sistema com conexão à RAWG API.

**Fluxo Principal:**
1. O usuário acessa `/explore`
2. Digita o nome do jogo no campo de busca
3. Clica em "Buscar" ou pressiona Enter
4. O sistema envia requisição à RAWG API com o termo de busca
5. Os resultados são exibidos em grid com capa, título, gênero e nota Metacritic

**Fluxos Alternativos:**
- 4a. RAWG API indisponível → exibe "Erro ao buscar jogos"
- 5a. Nenhum resultado → grid vazio, sem mensagem de erro

**Pós-condições:** Lista de jogos exibida ao usuário.

---

## UC05 — Visualizar Detalhes de um Jogo

**Ator:** Qualquer usuário  
**Pré-condições:** Jogo existe na RAWG API.

**Fluxo Principal:**
1. O usuário clica no card de um jogo nos resultados da busca
2. O sistema busca os detalhes do jogo na RAWG API via rawgId
3. Exibe: título, capa, gêneros, plataformas, data de lançamento, nota Metacritic, descrição

**Fluxos Alternativos:**
- 2a. Jogo não encontrado na RAWG → exibe erro 404

**Pós-condições:** Detalhes do jogo apresentados.

---

## UC06 — Adicionar Jogo à Biblioteca

**Ator:** Usuário autenticado  
**Pré-condições:** Usuário está logado. Jogo retornado pela busca da RAWG.

**Fluxo Principal:**
1. Na tela de Explorar, o usuário clica em "+ Biblioteca" no card do jogo
2. O sistema verifica se o jogo já existe localmente (por rawgId); se não, cria o registro
3. Cria uma entrada UserGame com status "backlog"
4. Exibe confirmação: "[Título] adicionado ao backlog!"

**Fluxos Alternativos:**
- 3a. Jogo já está na biblioteca → exibe "Jogo já está na sua biblioteca"
- 1a. Usuário não autenticado → redireciona para `/login`

**Pós-condições:** Entrada UserGame criada com status "backlog".

---

## UC07 — Atualizar Status do Jogo na Biblioteca

**Ator:** Usuário autenticado  
**Pré-condições:** Jogo está na biblioteca do usuário.

**Fluxo Principal:**
1. O usuário acessa `/library`
2. Localiza o jogo desejado
3. Altera o status pelo seletor (Backlog / Jogando / Completado / Abandonado)
4. O sistema persiste a alteração

**Fluxos Alternativos:**
- 4a. Erro de rede → exibe "Erro ao atualizar status"

**Pós-condições:** Status do UserGame atualizado no banco de dados.

---

## UC08 — Remover Jogo da Biblioteca

**Ator:** Usuário autenticado  
**Pré-condições:** Jogo está na biblioteca do usuário.

**Fluxo Principal:**
1. Na tela `/library`, o usuário clica em "Remover"
2. O sistema exibe confirmação ("Remover jogo da biblioteca?")
3. O usuário confirma
4. O sistema deleta o registro UserGame

**Fluxos Alternativos:**
- 3a. Usuário cancela → nenhuma alteração

**Pós-condições:** Registro UserGame excluído. Jogo não aparece mais na biblioteca.

---

## UC09 — Escrever Avaliação de um Jogo

**Ator:** Usuário autenticado  
**Pré-condições:** Jogo deve existir na base local (ter sido adicionado à biblioteca primeiro).

**Fluxo Principal:**
1. O usuário acessa `/reviews`
2. Clica em "+ Nova Avaliação"
3. Informa: rawgId do jogo, nota (1–10), título e texto da avaliação
4. Clica em "Publicar Avaliação"
5. O sistema valida e salva a review

**Fluxos Alternativos:**
- 3a. Nota fora do intervalo 1–10 → exibe "rating deve ser entre 1 e 10"
- 5a. Usuário já avaliou o jogo → exibe "Você já avaliou este jogo"
- 5b. Jogo não existe na base local → exibe instrução para adicionar à biblioteca

**Pós-condições:** Review criada e associada ao usuário e ao jogo.

---

## UC10 — Editar Avaliação

**Ator:** Usuário autenticado (autor da review)  
**Pré-condições:** Usuário possui ao menos uma avaliação publicada.

**Fluxo Principal:**
1. O usuário acessa `/reviews`
2. Clica em "Editar" em uma das suas avaliações
3. Altera nota, título e/ou conteúdo no formulário
4. Clica em "Salvar Alterações"
5. O sistema atualiza o registro

**Fluxos Alternativos:**
- 4a. Campos obrigatórios vazios → validação impede envio

**Pós-condições:** Review atualizada no banco de dados.

---

## UC11 — Excluir Avaliação

**Ator:** Usuário autenticado (autor da review)  
**Pré-condições:** Usuário possui ao menos uma avaliação publicada.

**Fluxo Principal:**
1. O usuário clica em "Excluir" em uma de suas avaliações
2. Confirma a exclusão no dialog
3. O sistema deleta o registro

**Fluxos Alternativos:**
- 2a. Usuário cancela → nenhuma alteração

**Pós-condições:** Review excluída do banco de dados.

---

## UC12 — Criar Post no Fórum

**Ator:** Usuário autenticado  
**Pré-condições:** Usuário está logado.

**Fluxo Principal:**
1. O usuário acessa `/forum`
2. Clica em "+ Novo Post"
3. Preenche título e conteúdo (opcionalmente informa rawgId para vincular a um jogo)
4. Clica em "Publicar"
5. O sistema cria o post e exibe na lista

**Fluxos Alternativos:**
- 3a. Campos obrigatórios vazios → validação impede envio

**Pós-condições:** ForumPost criado e visível para todos os usuários.

---

## UC13 — Editar Post no Fórum

**Ator:** Usuário autenticado (autor do post)  
**Pré-condições:** Usuário é autor do post.

**Fluxo Principal:**
1. O usuário abre o post em `/forum/:id`
2. Clica em "Editar" (visível apenas para o autor)
3. Altera título e/ou conteúdo
4. Salva as alterações

**Fluxos Alternativos:**
- 4a. Post não encontrado → erro 404

**Pós-condições:** Post atualizado.

---

## UC14 — Excluir Post no Fórum

**Ator:** Usuário autenticado (autor do post)  
**Pré-condições:** Usuário é autor do post.

**Fluxo Principal:**
1. O usuário abre o post em `/forum/:id`
2. Clica em "Excluir Post"
3. Confirma a exclusão
4. O sistema deleta o post e todos os seus comentários (cascade)
5. O usuário é redirecionado para `/forum`

**Fluxos Alternativos:**
- 3a. Usuário cancela → nenhuma alteração

**Pós-condições:** Post e comentários excluídos.

---

## UC15 — Comentar em um Post

**Ator:** Usuário autenticado  
**Pré-condições:** Post existe, usuário está logado.

**Fluxo Principal:**
1. O usuário acessa `/forum/:id`
2. Digita um comentário no campo da seção de comentários
3. Clica em "Comentar"
4. O sistema cria o PostComment e exibe imediatamente na lista

**Fluxos Alternativos:**
- 3a. Campo vazio → validação impede envio

**Pós-condições:** PostComment criado e visível para todos.

---

## UC16 — Excluir Comentário Próprio

**Ator:** Usuário autenticado (autor do comentário)  
**Pré-condições:** Usuário é autor do comentário.

**Fluxo Principal:**
1. O usuário localiza seu comentário no post
2. Clica no botão "×" ao lado do comentário
3. O sistema exclui o comentário e remove da lista sem reload

**Fluxos Alternativos:**
- 2a. Comentário não pertence ao usuário → API retorna 404

**Pós-condições:** Comentário excluído.

---

## UC17 — Visualizar Ranking de Usuários

**Ator:** Qualquer usuário  
**Pré-condições:** Ao menos um usuário possui jogos com status "completed".

**Fluxo Principal:**
1. O usuário acessa `/ranking`
2. O sistema agrega: usuários ordenados por contagem de UserGame com status "completed"
3. Exibe: posição, username, avatar (se houver), total de jogos completados, média de % de conclusão

**Fluxos Alternativos:**
- 2a. Nenhum jogo completado → exibe "Nenhum jogador no ranking ainda"

**Pós-condições:** Lista de ranking exibida em tempo real.

---

## UC18 — Atualizar Perfil do Usuário

**Ator:** Usuário autenticado  
**Pré-condições:** Usuário está logado.

**Fluxo Principal:**
1. O usuário acessa `/profile`
2. Visualiza suas estatísticas (jogos, avaliações, posts)
3. Clica em "Editar Perfil"
4. Altera username e/ou URL do avatar
5. Clica em "Salvar"
6. O sistema atualiza o registro e exibe confirmação

**Fluxos Alternativos:**
- 5a. Novo username já em uso → exibe "Username já em uso"

**Pós-condições:** Dados do usuário atualizados.
