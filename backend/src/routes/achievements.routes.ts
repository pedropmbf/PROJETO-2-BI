import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { validateAchievementInput } from '../utils/content.utils';

const router = Router();

// Listar todas as definições de conquistas (público)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { points: 'asc' },
    });
    res.json(achievements);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Minhas conquistas: todas as definições marcadas como desbloqueadas ou não
router.get('/mine', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [all, mine] = await Promise.all([
      prisma.achievement.findMany({ orderBy: { points: 'asc' } }),
      prisma.userAchievement.findMany({ where: { userId: req.userId! } }),
    ]);
    const unlockedMap = new Map(mine.map((u) => [u.achievementId, u.unlockedAt]));
    const result = all.map((a) => ({
      ...a,
      unlocked: unlockedMap.has(a.id),
      unlockedAt: unlockedMap.get(a.id) ?? null,
    }));
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar conquista (admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, title, description, icon, points } = req.body;
    const validationError = validateAchievementInput(code, title, description);
    if (validationError) { res.status(400).json({ error: validationError }); return; }

    const achievement = await prisma.achievement.create({
      data: { code, title, description, icon, points: points ?? 0 },
    });
    res.status(201).json(achievement);
  } catch (err: any) {
    if (err.code === 'P2002') { res.status(409).json({ error: 'Já existe uma conquista com esse código' }); return; }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Editar conquista (admin)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.achievement.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Conquista não encontrada' }); return; }

    const { code, title, description, icon, points } = req.body;
    const validationError = validateAchievementInput(code, title, description);
    if (validationError) { res.status(400).json({ error: validationError }); return; }

    const updated = await prisma.achievement.update({
      where: { id },
      data: { code, title, description, icon, points },
    });
    res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2002') { res.status(409).json({ error: 'Já existe uma conquista com esse código' }); return; }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir conquista (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.achievement.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Conquista não encontrada' }); return; }
    await prisma.achievement.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
