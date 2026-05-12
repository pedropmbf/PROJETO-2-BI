import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// UC17 - Visualizar ranking de usuários (por jogos completados)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const ranking = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        _count: {
          select: {
            userGames: { where: { status: 'completed' } },
          },
        },
        userGames: {
          where: { status: 'completed' },
          select: { completionPercentage: true },
        },
      },
      orderBy: {
        userGames: { _count: 'desc' },
      },
      take: 50,
    });

    const result = ranking.map((u, index) => ({
      position: index + 1,
      userId: u.id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      completedGames: u._count.userGames,
      avgCompletion:
        u.userGames.length > 0
          ? Math.round(
              u.userGames.reduce((acc, g) => acc + (g.completionPercentage ?? 0), 0) /
                u.userGames.length
            )
          : 0,
    }));

    res.json(result);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
