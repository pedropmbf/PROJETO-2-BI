import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';

vi.mock('../../lib/prisma', () => ({
  default: {
    forumPost: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    postComment: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    game: {
      findUnique: vi.fn(),
    },
  },
}));

import prisma from '../../lib/prisma';

const USER_ID = 1;
const TOKEN = jwt.sign({ userId: USER_ID }, 'test-secret-key');

const fakePost = {
  id: 1,
  userId: USER_ID,
  gameId: null,
  title: 'Melhor RPG de 2024?',
  content: 'Qual foi o melhor?',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeComment = {
  id: 5,
  userId: USER_ID,
  postId: 1,
  content: 'Comentário original',
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/forum', () => {
  it('retorna lista de posts com status 200', async () => {
    vi.mocked(prisma.forumPost.findMany).mockResolvedValue([fakePost] as never);

    const res = await request(app).get('/api/forum');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/forum/:id', () => {
  it('retorna post com comentários', async () => {
    vi.mocked(prisma.forumPost.findUnique).mockResolvedValue({ ...fakePost, comments: [] } as never);

    const res = await request(app).get('/api/forum/1');

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Melhor RPG de 2024?');
  });

  it('retorna 404 quando post não existe', async () => {
    vi.mocked(prisma.forumPost.findUnique).mockResolvedValue(null);

    const res = await request(app).get('/api/forum/999');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/forum', () => {
  // CT-12
  it('cria post com dados válidos e retorna 201', async () => {
    vi.mocked(prisma.forumPost.create).mockResolvedValue(fakePost as never);

    const res = await request(app)
      .post('/api/forum')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Novo post', content: 'Conteúdo' });

    expect(res.status).toBe(201);
  });

  it('retorna 400 quando faltam campos obrigatórios', async () => {
    const res = await request(app)
      .post('/api/forum')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'só título' });

    expect(res.status).toBe(400);
  });

  it('retorna 401 sem token', async () => {
    const res = await request(app)
      .post('/api/forum')
      .send({ title: 't', content: 'c' });

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/forum/:id', () => {
  // CT-13
  it('atualiza post do dono e retorna 200', async () => {
    vi.mocked(prisma.forumPost.findFirst).mockResolvedValue(fakePost as never);
    vi.mocked(prisma.forumPost.update).mockResolvedValue({ ...fakePost, title: 'Editado' } as never);

    const res = await request(app)
      .put('/api/forum/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Editado', content: 'novo' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Editado');
  });

  it('retorna 404 quando post não pertence ao usuário', async () => {
    vi.mocked(prisma.forumPost.findFirst).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/forum/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 't', content: 'c' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/forum/:id', () => {
  // CT-14
  it('exclui post do dono e retorna 204', async () => {
    vi.mocked(prisma.forumPost.findFirst).mockResolvedValue(fakePost as never);
    vi.mocked(prisma.forumPost.delete).mockResolvedValue(fakePost as never);

    const res = await request(app)
      .delete('/api/forum/1')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(204);
  });

  it('retorna 404 quando post não pertence ao usuário', async () => {
    vi.mocked(prisma.forumPost.findFirst).mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/forum/1')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/forum/:id/comments', () => {
  // CT-13 - Comentar em post
  it('cria comentário em post existente e retorna 201', async () => {
    vi.mocked(prisma.forumPost.findUnique).mockResolvedValue(fakePost as never);
    vi.mocked(prisma.postComment.create).mockResolvedValue(fakeComment as never);

    const res = await request(app)
      .post('/api/forum/1/comments')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ content: 'Meu comentário' });

    expect(res.status).toBe(201);
  });

  it('retorna 400 quando content está vazio', async () => {
    const res = await request(app)
      .post('/api/forum/1/comments')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ content: '' });

    expect(res.status).toBe(400);
  });

  it('retorna 404 quando post inexistente', async () => {
    vi.mocked(prisma.forumPost.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/forum/999/comments')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ content: 'qualquer' });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/forum/comments/:id', () => {
  // CT-22
  it('edita comentário próprio e retorna 200', async () => {
    vi.mocked(prisma.postComment.findFirst).mockResolvedValue(fakeComment as never);
    vi.mocked(prisma.postComment.update).mockResolvedValue({
      ...fakeComment,
      content: 'Comentário editado',
    } as never);

    const res = await request(app)
      .put('/api/forum/comments/5')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ content: 'Comentário editado' });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Comentário editado');
  });

  it('retorna 404 quando comentário não pertence ao usuário', async () => {
    vi.mocked(prisma.postComment.findFirst).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/forum/comments/5')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ content: 'Tentativa' });

    expect(res.status).toBe(404);
  });

  it('retorna 400 quando content está vazio', async () => {
    const res = await request(app)
      .put('/api/forum/comments/5')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ content: '   ' });

    expect(res.status).toBe(400);
  });

  it('retorna 401 sem token', async () => {
    const res = await request(app)
      .put('/api/forum/comments/5')
      .send({ content: 'x' });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/forum/comments/:id', () => {
  // CT-16 - Excluir comentário próprio
  it('exclui comentário próprio e retorna 204', async () => {
    vi.mocked(prisma.postComment.findFirst).mockResolvedValue(fakeComment as never);
    vi.mocked(prisma.postComment.delete).mockResolvedValue(fakeComment as never);

    const res = await request(app)
      .delete('/api/forum/comments/5')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(204);
  });

  it('retorna 404 quando comentário não pertence ao usuário', async () => {
    vi.mocked(prisma.postComment.findFirst).mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/forum/comments/5')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(404);
  });
});
