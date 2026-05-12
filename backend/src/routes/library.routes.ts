import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

// UC06 - Adicionar jogo à biblioteca
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rawgId, title, coverImage, genre, releasedAt, metacriticScore, status } = req.body;

    let game = await prisma.game.findUnique({ where: { rawgId } });
    if (!game) {
      game = await prisma.game.create({
        data: {
          rawgId,
          title,
          coverImage,
          genre,
          releasedAt: releasedAt ? new Date(releasedAt) : null,
          metacriticScore,
        },
      });
    }

    const userGame = await prisma.userGame.create({
      data: { userId: req.userId!, gameId: game.id, status: status || 'backlog' },
      include: { game: true },
    });

    res.status(201).json(userGame);
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Jogo já está na sua biblioteca' });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar biblioteca do usuário
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const userGames = await prisma.userGame.findMany({
      where: {
        userId: req.userId!,
        ...(status ? { status: status as any } : {}),
      },
      include: { game: true },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(userGames);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC07 - Atualizar status do jogo
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, hoursPlayed, completionPercentage } = req.body;

    const userGame = await prisma.userGame.findFirst({
      where: { id: Number(id), userId: req.userId! },
    });
    if (!userGame) {
      res.status(404).json({ error: 'Entrada não encontrada' });
      return;
    }

    const updated = await prisma.userGame.update({
      where: { id: Number(id) },
      data: { status, hoursPlayed, completionPercentage },
      include: { game: true },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC08 - Remover jogo da biblioteca
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userGame = await prisma.userGame.findFirst({
      where: { id: Number(id), userId: req.userId! },
    });
    if (!userGame) {
      res.status(404).json({ error: 'Entrada não encontrada' });
      return;
    }
    await prisma.userGame.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
