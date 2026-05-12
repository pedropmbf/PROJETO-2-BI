import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// Listar posts (público)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await prisma.forumPost.findMany({
      include: {
        user: { select: { username: true, avatarUrl: true } },
        game: { select: { title: true, coverImage: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Ver post com comentários (público)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: { select: { username: true, avatarUrl: true } },
        game: { select: { title: true } },
        comments: {
          include: { user: { select: { username: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!post) {
      res.status(404).json({ error: 'Post não encontrado' });
      return;
    }
    res.json(post);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.use(authenticate);

// UC12 - Criar post
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, rawgId } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'title e content são obrigatórios' });
      return;
    }

    let gameId: number | null = null;
    if (rawgId) {
      const game = await prisma.game.findUnique({ where: { rawgId } });
      if (game) gameId = game.id;
    }

    const post = await prisma.forumPost.create({
      data: { userId: req.userId!, title, content, gameId },
      include: { user: { select: { username: true } } },
    });
    res.status(201).json(post);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC13 - Editar post
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const post = await prisma.forumPost.findFirst({
      where: { id: Number(id), userId: req.userId! },
    });
    if (!post) {
      res.status(404).json({ error: 'Post não encontrado' });
      return;
    }
    const updated = await prisma.forumPost.update({
      where: { id: Number(id) },
      data: { title, content },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC14 - Excluir post
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await prisma.forumPost.findFirst({
      where: { id: Number(id), userId: req.userId! },
    });
    if (!post) {
      res.status(404).json({ error: 'Post não encontrado' });
      return;
    }
    await prisma.forumPost.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC15 - Comentar em post
router.post('/:id/comments', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'content é obrigatório' });
      return;
    }
    const post = await prisma.forumPost.findUnique({ where: { id: Number(id) } });
    if (!post) {
      res.status(404).json({ error: 'Post não encontrado' });
      return;
    }
    const comment = await prisma.postComment.create({
      data: { userId: req.userId!, postId: Number(id), content },
      include: { user: { select: { username: true } } },
    });
    res.status(201).json(comment);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// UC16 - Excluir comentário
router.delete('/comments/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const comment = await prisma.postComment.findFirst({
      where: { id: Number(id), userId: req.userId! },
    });
    if (!comment) {
      res.status(404).json({ error: 'Comentário não encontrado' });
      return;
    }
    await prisma.postComment.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
