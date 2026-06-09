import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

// Toda a área admin exige autenticação + papel ADMIN
router.use(authenticate, requireAdmin);

// Estatísticas para o painel
router.get('/stats', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [users, quizzes, lists, news, achievements] = await Promise.all([
      prisma.user.count(),
      prisma.quiz.count(),
      prisma.gameList.count(),
      prisma.newsPost.count(),
      prisma.achievement.count(),
    ]);
    res.json({ users, quizzes, lists, news, achievements });
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar usuários
router.get('/users', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { quizzes: true, gameLists: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Alterar papel de um usuário (USER <-> ADMIN)
router.patch('/users/:id/role', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;
    if (role !== 'USER' && role !== 'ADMIN') {
      res.status(400).json({ error: "role deve ser 'USER' ou 'ADMIN'" });
      return;
    }
    if (id === req.userId!) {
      res.status(400).json({ error: 'Você não pode alterar o seu próprio papel' });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, email: true, role: true },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir um usuário (cascade cuida das relações)
router.delete('/users/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (id === req.userId!) {
      res.status(400).json({ error: 'Você não pode excluir a sua própria conta por aqui' });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
