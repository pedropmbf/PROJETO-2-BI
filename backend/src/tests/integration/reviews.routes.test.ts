import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';

vi.mock('../../lib/prisma', () => ({
  default: {
    game: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    review: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import prisma from '../../lib/prisma';

const USER_ID = 1;
const TOKEN = jwt.sign({ userId: USER_ID }, 'test-secret-key');

const fakeGame = {
  id: 10,
  rawgId: 5638,
  title: 'The Legend of Zelda',
  coverImage: null,
  genre: 'Action',
  releasedAt: null,
  metacriticScore: null,
};

const fakeReview = {
  id: 1,
  userId: USER_ID,
  gameId: 10,
  rating: 9,
  title: 'Obra-prima',
  content: 'Jogo incrível',
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/reviews/game/:rawgId', () => {
  it('retorna lista de reviews quando game existe', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(fakeGame);
    vi.mocked(prisma.review.findMany).mockResolvedValue([fakeReview] as never);

    const res = await request(app).get('/api/reviews/game/5638');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Obra-prima');
  });

  it('retorna array vazio quando game não existe localmente', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(null);

    const res = await request(app).get('/api/reviews/game/9999');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/reviews/mine', () => {
  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/reviews/mine');
    expect(res.status).toBe(401);
  });

  it('retorna lista do usuário com 200', async () => {
    vi.mocked(prisma.review.findMany).mockResolvedValue([fakeReview] as never);

    const res = await request(app)
      .get('/api/reviews/mine')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/reviews', () => {
  // CT-10
  it('cria review com dados válidos e retorna 201', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(fakeGame);
    vi.mocked(prisma.review.create).mockResolvedValue(fakeReview as never);

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ rawgId: 5638, rating: 9, title: 'Obra-prima', content: 'Jogo incrível' });

    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(9);
  });

  it('cria o game localmente quando não existe', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.game.create).mockResolvedValue(fakeGame);
    vi.mocked(prisma.review.create).mockResolvedValue(fakeReview as never);

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ rawgId: 5638, gameTitle: 'Zelda', rating: 9, title: 'Top', content: 'Excelente' });

    expect(res.status).toBe(201);
    expect(prisma.game.create).toHaveBeenCalled();
  });

  // CT-11
  it('retorna 400 com rating fora do intervalo 1-10', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ rawgId: 5638, rating: 11, title: 't', content: 'c' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('rating deve ser entre 1 e 10');
  });

  it('retorna 400 quando campos obrigatórios ausentes', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ rawgId: 5638 });

    expect(res.status).toBe(400);
  });

  it('retorna 409 quando usuário já avaliou o jogo', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(fakeGame);
    const dupError = Object.assign(new Error('Unique'), { code: 'P2002' });
    vi.mocked(prisma.review.create).mockRejectedValue(dupError);

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ rawgId: 5638, rating: 5, title: 't', content: 'c' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Você já avaliou este jogo');
  });
});

describe('PUT /api/reviews/:id', () => {
  it('atualiza review do dono e retorna 200', async () => {
    vi.mocked(prisma.review.findFirst).mockResolvedValue(fakeReview as never);
    vi.mocked(prisma.review.update).mockResolvedValue({ ...fakeReview, rating: 8 } as never);

    const res = await request(app)
      .put('/api/reviews/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ rating: 8, title: 'Editado', content: 'Novo' });

    expect(res.status).toBe(200);
    expect(res.body.rating).toBe(8);
  });

  it('retorna 404 quando review não pertence ao usuário', async () => {
    vi.mocked(prisma.review.findFirst).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/reviews/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ rating: 8, title: 't', content: 'c' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/reviews/:id', () => {
  it('exclui review do dono e retorna 204', async () => {
    vi.mocked(prisma.review.findFirst).mockResolvedValue(fakeReview as never);
    vi.mocked(prisma.review.delete).mockResolvedValue(fakeReview as never);

    const res = await request(app)
      .delete('/api/reviews/1')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(204);
  });

  it('retorna 404 quando review não pertence ao usuário', async () => {
    vi.mocked(prisma.review.findFirst).mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/reviews/1')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(404);
  });
});
