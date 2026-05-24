import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';

vi.mock('../../lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import prisma from '../../lib/prisma';

const USER_ID = 1;
const TOKEN = jwt.sign({ userId: USER_ID }, 'test-secret-key');

const fakeUser = {
  id: USER_ID,
  username: 'gamer01',
  email: 'gamer01@test.com',
  avatarUrl: null,
  createdAt: new Date(),
  _count: { userGames: 3, reviews: 2, posts: 1 },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/users/me', () => {
  // CT-18 - leitura
  it('retorna perfil do usuário autenticado com counts', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(fakeUser as never);

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('gamer01');
    expect(res.body._count.userGames).toBe(3);
  });

  it('retorna 404 quando user não encontrado', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(404);
  });

  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/users/me', () => {
  // CT-18 - atualização
  it('atualiza perfil e retorna 200', async () => {
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...fakeUser,
      username: 'novo_nome',
    } as never);

    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ username: 'novo_nome' });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('novo_nome');
  });

  it('retorna 409 quando username em uso (P2002)', async () => {
    const dupError = Object.assign(new Error('Unique'), { code: 'P2002' });
    vi.mocked(prisma.user.update).mockRejectedValue(dupError);

    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ username: 'duplicado' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Username já em uso');
  });
});

describe('DELETE /api/users/me', () => {
  // CT-23
  it('exclui conta do usuário autenticado e retorna 204', async () => {
    vi.mocked(prisma.user.delete).mockResolvedValue({ id: USER_ID } as never);

    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(204);
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: USER_ID } });
  });

  it('retorna 401 sem token', async () => {
    const res = await request(app).delete('/api/users/me');
    expect(res.status).toBe(401);
  });
});
