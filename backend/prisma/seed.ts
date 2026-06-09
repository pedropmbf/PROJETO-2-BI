import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Usuário admin para os quizzes oficiais e a área administrativa
  const adminHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gamelog.com' },
    update: { role: 'ADMIN' },
    create: { username: 'GameLog_Official', email: 'admin@gamelog.com', passwordHash: adminHash, role: 'ADMIN' },
  });

  // Quizzes oficiais
  const quizzes = [
    {
      title: 'GTA V — Você é fã de verdade?',
      description: 'Teste seus conhecimentos sobre Grand Theft Auto V: personagens, missões e o mundo de Los Santos.',
      coverImage: 'https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg',
      questions: [
        {
          text: 'Em qual cidade fictícia o GTA V se passa?',
          options: ['Los Santos', 'Vice City', 'Liberty City', 'Las Venturas'],
          correctIndex: 0,
        },
        {
          text: 'Quem são os três protagonistas jogáveis do GTA V?',
          options: ['Michael, Franklin e Trevor', 'Niko, Tommy e CJ', 'Michael, Jimmy e Trevor', 'Franklin, Lamar e Trevor'],
          correctIndex: 0,
        },
        {
          text: 'Em qual estado fictício GTA V se passa?',
          options: ['San Andreas', 'Vice City', 'Liberty State', 'Alderney'],
          correctIndex: 0,
        },
        {
          text: 'Qual agência governamental recruta os protagonistas para missões secretas?',
          options: ['FIB', 'IAA', 'Merryweather', 'LSPD'],
          correctIndex: 0,
        },
        {
          text: 'Qual é a ocupação de Franklin no início do jogo?',
          options: ['Repositor de carros', 'Mecânico', 'Policial corrupto', 'Motorista de táxi'],
          correctIndex: 0,
        },
        {
          text: 'Michael fez um acordo secreto com qual agente do FIB para escapar da prisão?',
          options: ['Dave Norton', 'Steve Haines', 'Andreas Sanchez', 'Ron Jakowski'],
          correctIndex: 0,
        },
        {
          text: 'Qual personagem possui uma empresa chamada "Trevor Philips Industries"?',
          options: ['Trevor', 'Michael', 'Franklin', 'Lester'],
          correctIndex: 0,
        },
        {
          text: 'Em qual bairro rico de Los Santos Michael mora com sua família?',
          options: ['Rockford Hills', 'Vinewood Hills', 'Paleto Bay', 'Sandy Shores'],
          correctIndex: 0,
        },
        {
          text: 'Qual é o nome do melhor amigo de Franklin no início do jogo?',
          options: ['Lamar Davis', 'Stretch', 'Tonya Wiggins', 'Chop'],
          correctIndex: 0,
        },
        {
          text: 'Como se chama o maior assalto do jogo, considerado o clímax da história?',
          options: ['The Big Score', 'The Paleto Score', 'The Bureau Raid', 'The Jewel Store Job'],
          correctIndex: 0,
        },
      ],
    },
    {
      title: 'The Legend of Zelda — Mestre de Hyrule',
      description: 'Perguntas sobre a série Zelda com foco em Breath of the Wild e Tears of the Kingdom.',
      coverImage: 'https://media.rawg.io/media/games/cc6/cc60fe6cbc7e6d1e6d65cf5512a3ef85.jpg',
      questions: [
        {
          text: 'Qual é o nome do protagonista jogável da série The Legend of Zelda?',
          options: ['Link', 'Zelda', 'Ganon', 'Sheik'],
          correctIndex: 0,
        },
        {
          text: 'Por quantos anos Link esteve dormindo no Santuário da Ressurreição em Breath of the Wild?',
          options: ['100 anos', '10 anos', '50 anos', '1000 anos'],
          correctIndex: 0,
        },
        {
          text: 'Qual é o nome do vilão principal em Breath of the Wild?',
          options: ['Calamity Ganon', 'Ganondorf', 'Demise', 'Yuga'],
          correctIndex: 0,
        },
        {
          text: 'Quantos Divinos Animais precisam ser libertados em Breath of the Wild?',
          options: ['4', '3', '5', '6'],
          correctIndex: 0,
        },
        {
          text: 'Em qual reino se passa a maioria dos jogos da série Zelda?',
          options: ['Hyrule', 'Termina', 'Lorule', 'Holodrum'],
          correctIndex: 0,
        },
        {
          text: 'Qual item permite a Link criar objetos e estruturas em Tears of the Kingdom?',
          options: ['Ultramão', 'Magnesis', 'Stasis', 'Cryonis'],
          correctIndex: 0,
        },
        {
          text: 'O que são as "Sheikah Towers" em Breath of the Wild?',
          options: ['Torres que revelam o mapa da região', 'Dungeons secretas', 'Templos dos sábios', 'Postos Gerudo'],
          correctIndex: 0,
        },
        {
          text: 'Qual é o nome do campeão Goron em Breath of the Wild?',
          options: ['Daruk', 'Darunia', 'Yunobo', 'Goron Elder'],
          correctIndex: 0,
        },
        {
          text: 'Qual item icônico Link obtém após completar a floresta de Kokiri no Ocarina of Time?',
          options: ['Espada Kokiri', 'Master Sword', 'Espada da Luz', 'Biggoron Sword'],
          correctIndex: 0,
        },
        {
          text: 'Qual é o nome da Triforce que Ganondorf geralmente possui?',
          options: ['Triforce do Poder', 'Triforce da Coragem', 'Triforce da Sabedoria', 'Triforce da Luz'],
          correctIndex: 0,
        },
      ],
    },
    {
      title: 'God of War — Filho de Zeus ou Pai de Atreus?',
      description: 'Teste seus conhecimentos sobre a saga de Kratos, da mitologia grega à nórdica.',
      coverImage: 'https://media.rawg.io/media/games/4be/4be6a6ad0364751a96229c56bf69be73.jpg',
      questions: [
        {
          text: 'Qual é o nome do filho de Kratos em God of War (2018)?',
          options: ['Atreus', 'Deimos', 'Calliope', 'Perseus'],
          correctIndex: 0,
        },
        {
          text: 'Em qual mitologia God of War (2018) é ambientado?',
          options: ['Nórdica', 'Grega', 'Egípcia', 'Romana'],
          correctIndex: 0,
        },
        {
          text: 'Qual é o nome da esposa de Kratos que morreu antes dos eventos de God of War (2018)?',
          options: ['Faye', 'Lysandra', 'Calliope', 'Freya'],
          correctIndex: 0,
        },
        {
          text: 'Qual é a arma principal de Kratos em God of War (2018)?',
          options: ['Machado Leviatã', 'Lâminas do Caos', 'Lança do Olympus', 'Cabeça de Medusa'],
          correctIndex: 0,
        },
        {
          text: 'Qual deus nórdico é o antagonista principal de God of War (2018)?',
          options: ['Baldur', 'Thor', 'Odin', 'Loki'],
          correctIndex: 0,
        },
        {
          text: 'Qual é o objetivo final da jornada de Kratos e Atreus no jogo?',
          options: [
            'Espalhar as cinzas de Faye no pico mais alto dos Nove Mundos',
            'Derrotar Odin e destruir Asgard',
            'Recuperar o Machado Leviatã roubado',
            'Libertar os anões Brok e Sindri de uma maldição',
          ],
          correctIndex: 0,
        },
        {
          text: 'Qual dupla de anões ferreiros melhora as armas de Kratos durante o jogo?',
          options: ['Brok e Sindri', 'Mimir e Durlin', 'Reginn e Fafnir', 'Ivaldi e Gondul'],
          correctIndex: 0,
        },
        {
          text: 'O que é Mimir no jogo?',
          options: [
            'Uma cabeça decepada que serve de guia e conselheiro',
            'Um deus menor aprisionado',
            'Um anão com poderes mágicos',
            'O espírito de Faye reencarnado',
          ],
          correctIndex: 0,
        },
        {
          text: 'Qual é o nome do mundo central onde a maior parte da história acontece?',
          options: ['Midgard', 'Asgard', 'Helheim', 'Jotunheim'],
          correctIndex: 0,
        },
        {
          text: 'Qual revelação sobre Atreus é feita no final de God of War (2018)?',
          options: [
            'Seu verdadeiro nome nórdico é Loki',
            'Ele é filho secreto de Odin',
            'Ele é um deus grego disfarçado',
            'Ele é imortal por natureza divina',
          ],
          correctIndex: 0,
        },
      ],
    },
  ];

  for (const quizData of quizzes) {
    const existing = await prisma.quiz.findFirst({ where: { title: quizData.title } });
    if (!existing) {
      await prisma.quiz.create({
        data: {
          title: quizData.title,
          description: quizData.description,
          coverImage: quizData.coverImage,
          isOfficial: true,
          createdById: admin.id,
          questions: { create: quizData.questions },
        },
      });
      console.log(`✓ Quiz criado: ${quizData.title}`);
    } else {
      console.log(`- Quiz já existe: ${quizData.title}`);
    }
  }

  // Conquistas (definições gerenciadas pelo admin, desbloqueadas por ação)
  const achievements = [
    { code: 'FIRST_LIST', title: 'Colecionador', description: 'Crie sua primeira lista de jogos.', icon: '📋', points: 10 },
    { code: 'FIRST_REVIEW', title: 'Crítico de Plantão', description: 'Publique sua primeira avaliação.', icon: '✍️', points: 10 },
    { code: 'FIRST_QUIZ', title: 'Mestre do Quiz', description: 'Crie seu primeiro quiz personalizado.', icon: '🧠', points: 15 },
    { code: 'FIRST_POST', title: 'Voz da Comunidade', description: 'Faça sua primeira publicação no fórum.', icon: '💬', points: 10 },
    { code: 'GAME_ADDED', title: 'Bem-vindo à Biblioteca', description: 'Adicione seu primeiro jogo à biblioteca.', icon: '🎮', points: 5 },
  ];
  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: { title: ach.title, description: ach.description, icon: ach.icon, points: ach.points },
      create: ach,
    });
    console.log(`✓ Conquista pronta: ${ach.title}`);
  }

  // Notícia de exemplo (publicada)
  const newsTitle = 'Bem-vindo ao GameLog!';
  const existingNews = await prisma.newsPost.findFirst({ where: { title: newsTitle } });
  if (!existingNews) {
    await prisma.newsPost.create({
      data: {
        authorId: admin.id,
        title: newsTitle,
        summary: 'Conheça as novidades da plataforma: listas, conquistas e muito mais.',
        content:
          'O GameLog agora conta com listas temáticas de jogos, um sistema de conquistas e uma seção de notícias. ' +
          'Crie sua primeira lista, desbloqueie conquistas jogando e fique por dentro das atualizações por aqui!',
        published: true,
      },
    });
    console.log(`✓ Notícia criada: ${newsTitle}`);
  } else {
    console.log(`- Notícia já existe: ${newsTitle}`);
  }

  console.log('\nSeed concluído!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
