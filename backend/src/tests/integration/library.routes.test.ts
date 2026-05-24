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
    userGame: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
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

const fakeUserGame = {
  id: 1,
  userId: USER_ID,
  gameId: 10,
  status: 'backlog' as const,
  hoursPlayed: null,
  completionPercentage: null,
  addedAt: new Date(),
  updatedAt: new Date(),
  game: fakeGame,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/library', () => {
  // CT-06
  it('adiciona jogo à biblioteca com status backlog e retorna 201', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(fakeGame);
    vi.mocked(prisma.userGame.create).mockResolvedValue(fakeUserGame);

    const res = await request(app)
      .post('/api/library')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ rawgId: 5638, title: 'The Legend of Zelda', status: 'backlog' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('backlog');
    expect(res.body.game.rawgId).toBe(5638);
  });

  // CT-07
  it('retorna 409 quando jogo já está na biblioteca', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(fakeGame);
    const prismaError = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
    vi.mocked(prisma.userGame.create).mockRejectedValue(prismaError);

    const res = await request(app)
      .post('/api/library')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ rawgId: 5638, title: 'The Legend of Zelda' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Jogo já está na sua biblioteca');
  });

  // CT-15
  it('retorna 401 sem token de autenticação', async () => {
    const res = await request(app)
      .post('/api/library')
      .send({ rawgId: 5638, title: 'Zelda' });

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/library/:id', () => {
  // CT-08
  it('atualiza status do jogo para playing e retorna 200', async () => {
    vi.mocked(prisma.userGame.findFirst).mockResolvedValue(fakeUserGame);
    vi.mocked(prisma.userGame.update).mockResolvedValue({ ...fakeUserGame, status: 'playing' });

    const res = await request(app)
      .put('/api/library/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ status: 'playing' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('playing');
  });

  // CT-08b
  it('retorna 404 quando UserGame não pertence ao usuário', async () => {
    vi.mocked(prisma.userGame.findFirst).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/library/999')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ status: 'playing' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/library/:id', () => {
  // CT-09
  it('remove jogo da biblioteca e retorna 204', async () => {
    vi.mocked(prisma.userGame.findFirst).mockResolvedValue(fakeUserGame);
    vi.mocked(prisma.userGame.delete).mockResolvedValue(fakeUserGame);

    const res = await request(app)
      .delete('/api/library/1')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(204);
  });
});
