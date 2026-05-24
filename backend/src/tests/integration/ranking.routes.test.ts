import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

vi.mock('../../lib/prisma', () => ({
  default: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

import prisma from '../../lib/prisma';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/ranking', () => {
  // CT-14
  it('retorna ranking ordenado com posição e avgCompletion', async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      {
        id: 1,
        username: 'top',
        avatarUrl: null,
        _count: { userGames: 5 },
        userGames: [
          { completionPercentage: 100 },
          { completionPercentage: 80 },
          { completionPercentage: 60 },
          { completionPercentage: null },
          { completionPercentage: null },
        ],
      },
      {
        id: 2,
        username: 'segundo',
        avatarUrl: null,
        _count: { userGames: 2 },
        userGames: [
          { completionPercentage: 50 },
          { completionPercentage: 50 },
        ],
      },
    ] as never);

    const res = await request(app).get('/api/ranking');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].position).toBe(1);
    expect(res.body[0].username).toBe('top');
    expect(res.body[0].completedGames).toBe(5);
    // (100+80+60+0+0)/5 = 48
    expect(res.body[0].avgCompletion).toBe(48);
    expect(res.body[1].position).toBe(2);
    expect(res.body[1].avgCompletion).toBe(50);
  });

  it('retorna array vazio quando não há usuários com jogos completados', async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as never);

    const res = await request(app).get('/api/ranking');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('retorna avgCompletion = 0 quando usuário sem jogos', async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      {
        id: 3,
        username: 'novato',
        avatarUrl: null,
        _count: { userGames: 0 },
        userGames: [],
      },
    ] as never);

    const res = await request(app).get('/api/ranking');

    expect(res.status).toBe(200);
    expect(res.body[0].avgCompletion).toBe(0);
  });
});
