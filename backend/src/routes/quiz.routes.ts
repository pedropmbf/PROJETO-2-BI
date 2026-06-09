import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { validateQuizInput } from '../utils/quiz.utils';
import { grantAchievement } from '../utils/achievements.service';

const router = Router();

// UC19 - Listar quizzes
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        createdBy: { select: { username: true } },
        _count: { select: { questions: true, results: true } },
      },
      orderBy: [{ isOfficial: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(quizzes);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC19 - Detalhes de um quiz com perguntas (sem revelar resposta correta)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        createdBy: { select: { username: true } },
        questions: {
          select: { id: true, text: true, options: true },
        },
        _count: { select: { results: true } },
      },
    });
    if (!quiz) { res.status(404).json({ error: 'Quiz não encontrado' }); return; }
    res.json(quiz);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC21 - Ranking de um quiz
router.get('/:id/ranking', async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await prisma.userQuizResult.findMany({
      where: { quizId: Number(req.params.id) },
      include: { user: { select: { username: true, avatarUrl: true } } },
      orderBy: [{ score: 'desc' }, { completedAt: 'asc' }],
      take: 50,
    });

    const ranking = results.map((r, i) => ({
      position: i + 1,
      username: r.user.username,
      avatarUrl: r.user.avatarUrl,
      score: r.score,
      totalQuestions: r.totalQuestions,
      completedAt: r.completedAt,
    }));

    res.json(ranking);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.use(authenticate);

// UC22 - Buscar quiz para edição (inclui correctIndex; só dono pode acessar)
router.get('/:id/edit', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(req.params.id) },
      include: { questions: true },
    });
    if (!quiz) { res.status(404).json({ error: 'Quiz não encontrado' }); return; }
    if (quiz.isOfficial) { res.status(403).json({ error: 'Quizzes oficiais não podem ser editados' }); return; }
    if (quiz.createdById !== req.userId!) { res.status(403).json({ error: 'Sem permissão' }); return; }
    res.json(quiz);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC22 - Criar quiz personalizado
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, coverImage, questions } = req.body;
    const validationError = validateQuizInput(title, questions);
    if (validationError) { res.status(400).json({ error: validationError }); return; }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        coverImage,
        createdById: req.userId!,
        questions: { create: questions },
      },
      include: { _count: { select: { questions: true } } },
    });
    await grantAchievement(req.userId!, 'FIRST_QUIZ');
    res.status(201).json(quiz);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC22 - Editar quiz próprio (replace de perguntas em transação)
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quizId = Number(req.params.id);
    const existing = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!existing) { res.status(404).json({ error: 'Quiz não encontrado' }); return; }
    if (existing.isOfficial) { res.status(403).json({ error: 'Quizzes oficiais não podem ser editados' }); return; }
    if (existing.createdById !== req.userId!) { res.status(403).json({ error: 'Sem permissão' }); return; }

    const { title, description, coverImage, questions } = req.body;
    const validationError = validateQuizInput(title, questions);
    if (validationError) { res.status(400).json({ error: validationError }); return; }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({ where: { quizId } });
      return tx.quiz.update({
        where: { id: quizId },
        data: {
          title,
          description,
          coverImage,
          questions: { create: questions },
        },
        include: { _count: { select: { questions: true } } },
      });
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC20 - Submeter respostas e salvar score
router.post('/:id/submit', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quizId = Number(req.params.id);
    const { answers } = req.body; // { [questionId]: selectedIndex }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) { res.status(404).json({ error: 'Quiz não encontrado' }); return; }

    let score = 0;
    const details = quiz.questions.map((q) => {
      const selected = answers[q.id];
      const correct = selected === q.correctIndex;
      if (correct) score++;
      return { questionId: q.id, selected, correctIndex: q.correctIndex, correct };
    });

    // Upsert: salva ou atualiza mantendo o melhor score
    const existing = await prisma.userQuizResult.findUnique({
      where: { userId_quizId: { userId: req.userId!, quizId } },
    });

    const finalScore = existing ? Math.max(existing.score, score) : score;

    await prisma.userQuizResult.upsert({
      where: { userId_quizId: { userId: req.userId!, quizId } },
      update: { score: finalScore, completedAt: new Date() },
      create: { userId: req.userId!, quizId, score: finalScore, totalQuestions: quiz.questions.length },
    });

    // Posição no ranking
    const above = await prisma.userQuizResult.count({
      where: { quizId, score: { gt: finalScore } },
    });

    res.json({
      score: finalScore,
      totalQuestions: quiz.questions.length,
      percentage: Math.round((finalScore / quiz.questions.length) * 100),
      position: above + 1,
      details,
      improved: existing ? score > existing.score : true,
    });
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC23 - Excluir quiz próprio
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: Number(req.params.id) } });
    if (!quiz) { res.status(404).json({ error: 'Quiz não encontrado' }); return; }
    if (quiz.isOfficial) { res.status(403).json({ error: 'Quizzes oficiais não podem ser excluídos' }); return; }
    if (quiz.createdById !== req.userId!) { res.status(403).json({ error: 'Sem permissão' }); return; }
    await prisma.quiz.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
