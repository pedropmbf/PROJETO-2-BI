# Escopo do Projeto — GameLog

## Tema

**GameLog** é uma plataforma web para jogadores que desejam organizar sua biblioteca de jogos, registrar progresso, escrever avaliações, competir em rankings com outros usuários e participar de um fórum de discussão sobre jogos.

## Problema que Resolve

Jogadores que consomem múltiplas plataformas (PC, console, mobile) não têm uma forma centralizada e social de:
- Rastrear o que jogaram, estão jogando ou querem jogar
- Comparar progresso com amigos em um ranking competitivo
- Discutir jogos com outros jogadores em um fórum temático

## Funcionalidades Principais

| Funcionalidade               | Descrição                                                   |
|------------------------------|-------------------------------------------------------------|
| Biblioteca de jogos          | Adicionar, categorizar (backlog/jogando/completado/abandonado) e remover jogos |
| Ranking de jogadores         | Classificação por número de jogos completados e % de conclusão |
| Fórum                        | Posts e comentários sobre jogos ou temas gerais             |
| Avaliações                   | Notas (1–10) e textos de review por jogo                    |
| Perfil de usuário            | Estatísticas pessoais, avatar, histórico                    |

## Stack Tecnológica

### Front-end: React 18 + Vite + TypeScript
**Justificativa:** React é a biblioteca de UI mais adotada no mercado, com ecossistema maduro e ampla documentação. Vite oferece build e HMR extremamente rápidos. TypeScript adiciona segurança de tipos, reduzindo bugs em tempo de desenvolvimento. A equipe tem familiaridade com a stack.

### Back-end: Node.js + Express + TypeScript
**Justificativa:** Mesma linguagem do front-end, eliminando troca de contexto. Express é minimalista e flexível. O uso de TypeScript unifica o padrão de tipos entre front e back.

### Banco de Dados: PostgreSQL + Prisma ORM
**Justificativa:** PostgreSQL é um banco relacional robusto, open-source e amplamente suportado. Prisma ORM oferece type-safety, migrations automáticas e uma interface de query intuitiva. O modelo relacional do projeto (usuários → jogos → avaliações → posts) se adapta naturalmente ao paradigma relacional.

### API Externa: RAWG.io API
**Justificativa:** O RAWG é o maior banco de dados de jogos de videogame, com mais de 500.000 títulos. A API é gratuita (sem custo, apenas cadastro para obter chave), bem documentada e retorna dados ricos como capa, gênero, plataformas, pontuação Metacritic e descrição — suficientes para enriquecer as funcionalidades da plataforma sem necessidade de cadastro manual de jogos.

**Endpoint principal utilizado:**
- `GET https://api.rawg.io/api/games?search={query}&key={API_KEY}` — Busca de jogos por nome
- `GET https://api.rawg.io/api/games/{id}?key={API_KEY}` — Detalhes de um jogo

## Entidades do Sistema

```
User         → autenticação e perfil
Game         → cache local de dados da RAWG
UserGame     → relação user↔game com status e progresso
Review       → avaliação de um jogo por um usuário
ForumPost    → post no fórum (vinculado opcionalmente a um jogo)
PostComment  → comentário em um post do fórum
```

## Telas (6 com CRUD)

| Tela               | Entidade    | Operações CRUD                  |
|--------------------|-------------|---------------------------------|
| Autenticação       | User        | Create (registro), Read (login) |
| Explorar + Biblioteca | UserGame | Create, Read, Update, Delete   |
| Avaliações         | Review      | Create, Read, Update, Delete    |
| Fórum              | ForumPost + PostComment | Create, Read, Update, Delete |
| Perfil             | User        | Read, Update, Delete (excluir conta com cascade) |
| Quiz               | Quiz + Question | Create, Read, Update (replace transacional de perguntas), Delete |

Tela de Ranking: derivada (leitura agregada de UserGame, sem CRUD próprio).
