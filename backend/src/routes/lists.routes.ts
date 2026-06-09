import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { validateListInput } from '../utils/content.utils';
import { grantAchievement } from '../utils/achievements.service';

const router = Router();

// Listar listas públicas
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const lists = await prisma.gameList.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { username: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(lists);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Minhas listas (públicas e privadas)
router.get('/mine', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lists = await prisma.gameList.findMany({
      where: { userId: req.userId! },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(lists);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Detalhe de uma lista pública (com itens)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const list = await prisma.gameList.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: { select: { username: true } },
        items: { orderBy: { addedAt: 'asc' } },
      },
    });
    if (!list) { res.status(404).json({ error: 'Lista não encontrada' }); return; }
    if (!list.isPublic) { res.status(403).json({ error: 'Lista privada' }); return; }
    res.json(list);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar lista para edição (dono, mesmo se privada)
router.get('/:id/edit', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await prisma.gameList.findUnique({
      where: { id: Number(req.params.id) },
      include: { items: { orderBy: { addedAt: 'asc' } } },
    });
    if (!list) { res.status(404).json({ error: 'Lista não encontrada' }); return; }
    if (list.userId !== req.userId!) { res.status(403).json({ error: 'Sem permissão' }); return; }
    res.json(list);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar lista (opcionalmente com itens iniciais)
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, isPublic, items } = req.body;
    const validationError = validateListInput(title);
    if (validationError) { res.status(400).json({ error: validationError }); return; }

    const list = await prisma.gameList.create({
      data: {
        userId: req.userId!,
        title,
        description,
        isPublic: isPublic ?? true,
        items: Array.isArray(items)
          ? { create: items.map((i: any) => ({ rawgId: i.rawgId, title: i.title, coverImage: i.coverImage })) }
          : undefined,
      },
      include: { items: true, _count: { select: { items: true } } },
    });

    await grantAchievement(req.userId!, 'FIRST_LIST');
    res.status(201).json(list);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Editar lista própria (substitui itens em transação)
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listId = Number(req.params.id);
    const existing = await prisma.gameList.findUnique({ where: { id: listId } });
    if (!existing) { res.status(404).json({ error: 'Lista não encontrada' }); return; }
    if (existing.userId !== req.userId!) { res.status(403).json({ error: 'Sem permissão' }); return; }

    const { title, description, isPublic, items } = req.body;
    const validationError = validateListInput(title);
    if (validationError) { res.status(400).json({ error: validationError }); return; }

    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(items)) {
        await tx.gameListItem.deleteMany({ where: { listId } });
      }
      return tx.gameList.update({
        where: { id: listId },
        data: {
          title,
          description,
          isPublic,
          ...(Array.isArray(items)
            ? { items: { create: items.map((i: any) => ({ rawgId: i.rawgId, title: i.title, coverImage: i.coverImage })) } }
            : {}),
        },
        include: { items: true, _count: { select: { items: true } } },
      });
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir lista própria
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await prisma.gameList.findUnique({ where: { id: Number(req.params.id) } });
    if (!list) { res.status(404).json({ error: 'Lista não encontrada' }); return; }
    if (list.userId !== req.userId!) { res.status(403).json({ error: 'Sem permissão' }); return; }
    await prisma.gameList.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar um jogo à lista
router.post('/:id/items', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listId = Number(req.params.id);
    const { rawgId, title, coverImage } = req.body;
    if (!rawgId || !title) { res.status(400).json({ error: 'rawgId e title são obrigatórios' }); return; }

    const list = await prisma.gameList.findUnique({ where: { id: listId } });
    if (!list) { res.status(404).json({ error: 'Lista não encontrada' }); return; }
    if (list.userId !== req.userId!) { res.status(403).json({ error: 'Sem permissão' }); return; }

    const item = await prisma.gameListItem.create({
      data: { listId, rawgId, title, coverImage },
    });
    res.status(201).json(item);
  } catch (err: any) {
    if (err.code === 'P2002') { res.status(409).json({ error: 'Jogo já está nesta lista' }); return; }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Remover um jogo da lista
router.delete('/:id/items/:itemId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listId = Number(req.params.id);
    const list = await prisma.gameList.findUnique({ where: { id: listId } });
    if (!list) { res.status(404).json({ error: 'Lista não encontrada' }); return; }
    if (list.userId !== req.userId!) { res.status(403).json({ error: 'Sem permissão' }); return; }

    await prisma.gameListItem.deleteMany({
      where: { id: Number(req.params.itemId), listId },
    });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
