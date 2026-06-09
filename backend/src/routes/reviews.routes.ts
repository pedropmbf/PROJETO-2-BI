import { Router, Response, Request } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { grantAchievement } from '../utils/achievements.service';

const router = Router();

// Listar avaliações de um jogo (público)
router.get('/game/:rawgId', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawgId = Number(req.params.rawgId);
    const game = await prisma.game.findUnique({ where: { rawgId } });
    if (!game) { res.json([]); return; }
    const reviews = await prisma.review.findMany({
      where: { gameId: game.id },
      include: { user: { select: { username: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.use(authenticate);

// Listar minhas avaliações
router.get('/mine', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.userId! },
      include: {
        game: { select: { rawgId: true, title: true, coverImage: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC09 - Escrever avaliação (cria o jogo localmente se não existir)
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rawgId, gameTitle, gameCover, rating, title, content } = req.body;
    if (!rawgId || !rating || !title || !content) {
      res.status(400).json({ error: 'rawgId, rating, title e content são obrigatórios' });
      return;
    }
    if (rating < 1 || rating > 10) {
      res.status(400).json({ error: 'rating deve ser entre 1 e 10' });
      return;
    }

    // Garante que o jogo existe localmente (cria se necessário)
    let game = await prisma.game.findUnique({ where: { rawgId } });
    if (!game) {
      game = await prisma.game.create({
        data: { rawgId, title: gameTitle || 'Desconhecido', coverImage: gameCover },
      });
    }

    const review = await prisma.review.create({
      data: { userId: req.userId!, gameId: game.id, rating, title, content },
      include: {
        user: { select: { username: true } },
        game: { select: { rawgId: true, title: true, coverImage: true } },
      },
    });
    await grantAchievement(req.userId!, 'FIRST_REVIEW');
    res.status(201).json(review);
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Você já avaliou este jogo' });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC10 - Editar avaliação
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, title, content } = req.body;
    const review = await prisma.review.findFirst({
      where: { id: Number(id), userId: req.userId! },
    });
    if (!review) { res.status(404).json({ error: 'Avaliação não encontrada' }); return; }
    const updated = await prisma.review.update({
      where: { id: Number(id) },
      data: { rating, title, content },
      include: { game: { select: { rawgId: true, title: true, coverImage: true } } },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC11 - Excluir avaliação
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findFirst({
      where: { id: Number(id), userId: req.userId! },
    });
    if (!review) { res.status(404).json({ error: 'Avaliação não encontrada' }); return; }
    await prisma.review.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
