import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';

vi.mock('../../lib/prisma', () => ({
  default: {
    gameList: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    gameListItem: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    // usados por grantAchievement no POST de criação
    achievement: { findUnique: vi.fn() },
    userAchievement: { upsert: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import prisma from '../../lib/prisma';

const USER_ID = 1;
const TOKEN = jwt.sign({ userId: USER_ID }, 'test-secret-key');

const fakeList = {
  id: 1,
  userId: USER_ID,
  title: 'Top RPGs',
  description: null,
  isPublic: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeListWithItems = {
  ...fakeList,
  user: { username: 'gamer01' },
  items: [{ id: 5, listId: 1, rawgId: 3498, title: 'GTA V', coverImage: null, addedAt: new Date() }],
};

const otherList = { ...fakeList, userId: 999 };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.achievement.findUnique).mockResolvedValue(null as never);
});

describe('GET /api/lists', () => {
  it('lista listas públicas e retorna 200', async () => {
    vi.mocked(prisma.gameList.findMany).mockResolvedValue([fakeList] as never);
    const res = await request(app).get('/api/lists');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/lists/mine', () => {
  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/lists/mine');
    expect(res.status).toBe(401);
  });

  it('lista as listas do usuário com token e retorna 200', async () => {
    vi.mocked(prisma.gameList.findMany).mockResolvedValue([fakeList] as never);
    const res = await request(app).get('/api/lists/mine').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/lists/:id', () => {
  it('retorna detalhe de lista pública com itens', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(fakeListWithItems as never);
    const res = await request(app).get('/api/lists/1');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  it('retorna 404 quando a lista não existe', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(null as never);
    const res = await request(app).get('/api/lists/999');
    expect(res.status).toBe(404);
  });

  it('retorna 403 para lista privada', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue({ ...fakeListWithItems, isPublic: false } as never);
    const res = await request(app).get('/api/lists/1');
    expect(res.status).toBe(403);
  });
});

describe('GET /api/lists/:id/edit', () => {
  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/lists/1/edit');
    expect(res.status).toBe(401);
  });

  it('retorna a lista para o dono (mesmo privada)', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue({ ...fakeListWithItems, isPublic: false } as never);
    const res = await request(app).get('/api/lists/1/edit').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('retorna 403 quando não é o dono', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(otherList as never);
    const res = await request(app).get('/api/lists/1/edit').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(403);
  });

  it('retorna 404 quando a lista não existe', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(null as never);
    const res = await request(app).get('/api/lists/999/edit').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lists', () => {
  it('retorna 401 sem token', async () => {
    const res = await request(app).post('/api/lists').send({ title: 'X' });
    expect(res.status).toBe(401);
  });

  it('cria lista válida e retorna 201', async () => {
    vi.mocked(prisma.gameList.create).mockResolvedValue({ ...fakeList, items: [] } as never);
    const res = await request(app)
      .post('/api/lists')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Top RPGs', isPublic: true });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Top RPGs');
  });

  it('cria lista com itens iniciais e retorna 201', async () => {
    vi.mocked(prisma.gameList.create).mockResolvedValue(fakeListWithItems as never);
    const res = await request(app)
      .post('/api/lists')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Top RPGs', items: [{ rawgId: 3498, title: 'GTA V' }] });
    expect(res.status).toBe(201);
  });

  it('retorna 400 quando o título está vazio', async () => {
    const res = await request(app)
      .post('/api/lists')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: '   ' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/lists/:id', () => {
  it('atualiza lista própria em transação e retorna 200', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(fakeList as never);
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) =>
      cb({
        gameListItem: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        gameList: { update: vi.fn().mockResolvedValue({ ...fakeList, title: 'Atualizada', items: [] }) },
      })
    );
    const res = await request(app)
      .put('/api/lists/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Atualizada', items: [] });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Atualizada');
  });

  it('retorna 403 quando a lista não é do usuário', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(otherList as never);
    const res = await request(app)
      .put('/api/lists/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Nova' });
    expect(res.status).toBe(403);
  });

  it('retorna 404 quando a lista não existe', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(null as never);
    const res = await request(app)
      .put('/api/lists/999')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Nova' });
    expect(res.status).toBe(404);
  });

  it('retorna 400 quando o título está vazio', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(fakeList as never);
    const res = await request(app)
      .put('/api/lists/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: '' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/lists/:id', () => {
  it('exclui lista própria e retorna 204', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(fakeList as never);
    vi.mocked(prisma.gameList.delete).mockResolvedValue(fakeList as never);
    const res = await request(app).delete('/api/lists/1').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(204);
  });

  it('retorna 403 quando não é o dono', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(otherList as never);
    const res = await request(app).delete('/api/lists/1').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(403);
  });

  it('retorna 404 quando a lista não existe', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(null as never);
    const res = await request(app).delete('/api/lists/999').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lists/:id/items', () => {
  it('adiciona jogo à lista própria e retorna 201', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(fakeList as never);
    vi.mocked(prisma.gameListItem.create).mockResolvedValue({
      id: 5, listId: 1, rawgId: 3498, title: 'GTA V', coverImage: null, addedAt: new Date(),
    } as never);
    const res = await request(app)
      .post('/api/lists/1/items')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ rawgId: 3498, title: 'GTA V' });
    expect(res.status).toBe(201);
    expect(res.body.rawgId).toBe(3498);
  });

  it('retorna 400 quando faltam rawgId/title', async () => {
    const res = await request(app)
      .post('/api/lists/1/items')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('retorna 403 quando não é o dono', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(otherList as never);
    const res = await request(app)
      .post('/api/lists/1/items')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ rawgId: 3498, title: 'GTA V' });
    expect(res.status).toBe(403);
  });

  it('retorna 404 quando a lista não existe', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(null as never);
    const res = await request(app)
      .post('/api/lists/999/items')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ rawgId: 3498, title: 'GTA V' });
    expect(res.status).toBe(404);
  });

  it('retorna 409 quando o jogo já está na lista', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(fakeList as never);
    const err = Object.assign(new Error('dup'), { code: 'P2002' });
    vi.mocked(prisma.gameListItem.create).mockRejectedValue(err);
    const res = await request(app)
      .post('/api/lists/1/items')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ rawgId: 3498, title: 'GTA V' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/lists/:id/items/:itemId', () => {
  it('remove jogo da lista própria e retorna 204', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(fakeList as never);
    vi.mocked(prisma.gameListItem.deleteMany).mockResolvedValue({ count: 1 } as never);
    const res = await request(app).delete('/api/lists/1/items/5').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(204);
  });

  it('retorna 403 quando não é o dono', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(otherList as never);
    const res = await request(app).delete('/api/lists/1/items/5').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(403);
  });

  it('retorna 404 quando a lista não existe', async () => {
    vi.mocked(prisma.gameList.findUnique).mockResolvedValue(null as never);
    const res = await request(app).delete('/api/lists/999/items/5').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(404);
  });
});
