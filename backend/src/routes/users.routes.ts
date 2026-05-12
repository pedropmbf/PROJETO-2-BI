import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

// UC18 - Ver perfil do usuário autenticado
router.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            userGames: true,
            reviews: true,
            posts: true,
          },
        },
      },
    });
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC18 - Atualizar perfil
router.put('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, avatarUrl } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.userId! },
      data: { username, avatarUrl },
      select: { id: true, username: true, email: true, avatarUrl: true },
    });
    res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Username já em uso' });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
