import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';

vi.mock('../../lib/prisma', () => ({
  default: {
    newsPost: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: { findUnique: vi.fn() }, // usado por requireAdmin
  },
}));

import prisma from '../../lib/prisma';

const TOKEN = jwt.sign({ userId: 1 }, 'test-secret-key');

const fakeNews = {
  id: 1,
  authorId: 1,
  title: 'Novidade',
  summary: null,
  content: 'Conteúdo da notícia',
  coverImage: null,
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const asAdmin = () => vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never);
const asUser = () => vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'USER' } as never);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/news', () => {
  it('lista notícias publicadas e retorna 200', async () => {
    vi.mocked(prisma.newsPost.findMany).mockResolvedValue([fakeNews] as never);
    const res = await request(app).get('/api/news');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/news/:id', () => {
  it('retorna a notícia publicada', async () => {
    vi.mocked(prisma.newsPost.findUnique).mockResolvedValue(fakeNews as never);
    const res = await request(app).get('/api/news/1');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Novidade');
  });

  it('retorna 404 quando a notícia é rascunho (não publicada)', async () => {
    vi.mocked(prisma.newsPost.findUnique).mockResolvedValue({ ...fakeNews, published: false } as never);
    const res = await request(app).get('/api/news/1');
    expect(res.status).toBe(404);
  });

  it('retorna 404 quando a notícia não existe', async () => {
    vi.mocked(prisma.newsPost.findUnique).mockResolvedValue(null as never);
    const res = await request(app).get('/api/news/999');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/news/admin/all', () => {
  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/news/admin/all');
    expect(res.status).toBe(401);
  });

  it('retorna 403 para usuário comum', async () => {
    asUser();
    const res = await request(app).get('/api/news/admin/all').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(403);
  });

  it('lista todas as notícias (inclui rascunhos) para admin', async () => {
    asAdmin();
    vi.mocked(prisma.newsPost.findMany).mockResolvedValue([fakeNews, { ...fakeNews, id: 2, published: false }] as never);
    const res = await request(app).get('/api/news/admin/all').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('POST /api/news', () => {
  it('retorna 401 sem token', async () => {
    const res = await request(app).post('/api/news').send({ title: 'X', content: 'Y' });
    expect(res.status).toBe(401);
  });

  it('retorna 403 para usuário comum', async () => {
    asUser();
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'X', content: 'Y' });
    expect(res.status).toBe(403);
  });

  it('cria notícia quando admin e retorna 201', async () => {
    asAdmin();
    vi.mocked(prisma.newsPost.create).mockResolvedValue(fakeNews as never);
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Novidade', content: 'Conteúdo da notícia', published: true });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Novidade');
  });

  it('retorna 400 quando admin envia conteúdo vazio', async () => {
    asAdmin();
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Sem conteúdo', content: '' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/news/:id', () => {
  it('edita notícia quando admin e retorna 200', async () => {
    asAdmin();
    vi.mocked(prisma.newsPost.findUnique).mockResolvedValue(fakeNews as never);
    vi.mocked(prisma.newsPost.update).mockResolvedValue({ ...fakeNews, title: 'Editada' } as never);
    const res = await request(app)
      .put('/api/news/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Editada', content: 'Conteúdo' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Editada');
  });

  it('retorna 404 quando a notícia não existe', async () => {
    asAdmin();
    vi.mocked(prisma.newsPost.findUnique).mockResolvedValue(null as never);
    const res = await request(app)
      .put('/api/news/999')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'X', content: 'Y' });
    expect(res.status).toBe(404);
  });

  it('retorna 400 quando admin envia conteúdo vazio', async () => {
    asAdmin();
    vi.mocked(prisma.newsPost.findUnique).mockResolvedValue(fakeNews as never);
    const res = await request(app)
      .put('/api/news/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'X', content: '' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/news/:id', () => {
  it('exclui notícia quando admin e retorna 204', async () => {
    asAdmin();
    vi.mocked(prisma.newsPost.findUnique).mockResolvedValue(fakeNews as never);
    vi.mocked(prisma.newsPost.delete).mockResolvedValue(fakeNews as never);
    const res = await request(app).delete('/api/news/1').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(204);
  });

  it('retorna 404 quando a notícia não existe', async () => {
    asAdmin();
    vi.mocked(prisma.newsPost.findUnique).mockResolvedValue(null as never);
    const res = await request(app).delete('/api/news/999').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(404);
  });
});
