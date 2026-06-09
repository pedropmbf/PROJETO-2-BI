import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { validateNewsInput } from '../utils/content.utils';

const router = Router();

// Listar notícias publicadas (público)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const news = await prisma.newsPost.findMany({
      where: { published: true },
      include: { author: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(news);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar TODAS as notícias, inclusive rascunhos (admin)
router.get('/admin/all', authenticate, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const news = await prisma.newsPost.findMany({
      include: { author: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(news);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Detalhe de uma notícia publicada (público)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const news = await prisma.newsPost.findUnique({
      where: { id: Number(req.params.id) },
      include: { author: { select: { username: true } } },
    });
    if (!news || !news.published) { res.status(404).json({ error: 'Notícia não encontrada' }); return; }
    res.json(news);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar notícia (admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, summary, content, coverImage, published } = req.body;
    const validationError = validateNewsInput(title, content);
    if (validationError) { res.status(400).json({ error: validationError }); return; }

    const news = await prisma.newsPost.create({
      data: { authorId: req.userId!, title, summary, content, coverImage, published: published ?? false },
      include: { author: { select: { username: true } } },
    });
    res.status(201).json(news);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Editar notícia (admin)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.newsPost.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Notícia não encontrada' }); return; }

    const { title, summary, content, coverImage, published } = req.body;
    const validationError = validateNewsInput(title, content);
    if (validationError) { res.status(400).json({ error: validationError }); return; }

    const updated = await prisma.newsPost.update({
      where: { id },
      data: { title, summary, content, coverImage, published },
      include: { author: { select: { username: true } } },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir notícia (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.newsPost.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Notícia não encontrada' }); return; }
    await prisma.newsPost.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
