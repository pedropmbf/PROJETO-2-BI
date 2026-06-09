import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';

vi.mock('../../lib/prisma', () => ({
  default: {
    achievement: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    userAchievement: { findMany: vi.fn() },
    user: { findUnique: vi.fn() }, // usado por requireAdmin
  },
}));

import prisma from '../../lib/prisma';

const TOKEN = jwt.sign({ userId: 1 }, 'test-secret-key');

const fakeAchievement = {
  id: 1,
  code: 'FIRST_LIST',
  title: 'Colecionador',
  description: 'Crie sua primeira lista.',
  icon: '📋',
  points: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const asAdmin = () => vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never);
const asUser = () => vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'USER' } as never);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/achievements', () => {
  it('lista definições e retorna 200', async () => {
    vi.mocked(prisma.achievement.findMany).mockResolvedValue([fakeAchievement] as never);
    const res = await request(app).get('/api/achievements');
    expect(res.status).toBe(200);
    expect(res.body[0].code).toBe('FIRST_LIST');
  });
});

describe('GET /api/achievements/mine', () => {
  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/achievements/mine');
    expect(res.status).toBe(401);
  });

  it('marca conquistas desbloqueadas para o usuário', async () => {
    vi.mocked(prisma.achievement.findMany).mockResolvedValue([fakeAchievement] as never);
    vi.mocked(prisma.userAchievement.findMany).mockResolvedValue([
      { id: 1, userId: 1, achievementId: 1, unlockedAt: new Date() },
    ] as never);
    const res = await request(app)
      .get('/api/achievements/mine')
      .set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.body[0].unlocked).toBe(true);
  });

  it('marca conquistas bloqueadas quando o usuário não as possui', async () => {
    vi.mocked(prisma.achievement.findMany).mockResolvedValue([fakeAchievement] as never);
    vi.mocked(prisma.userAchievement.findMany).mockResolvedValue([] as never);
    const res = await request(app)
      .get('/api/achievements/mine')
      .set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.body[0].unlocked).toBe(false);
  });
});

describe('POST /api/achievements', () => {
  it('retorna 403 para usuário comum', async () => {
    asUser();
    const res = await request(app)
      .post('/api/achievements')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ code: 'NEW_ONE', title: 'Nova', description: 'desc' });
    expect(res.status).toBe(403);
  });

  it('cria conquista quando admin e retorna 201', async () => {
    asAdmin();
    vi.mocked(prisma.achievement.create).mockResolvedValue(fakeAchievement as never);
    const res = await request(app)
      .post('/api/achievements')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ code: 'FIRST_LIST', title: 'Colecionador', description: 'Crie sua primeira lista.' });
    expect(res.status).toBe(201);
  });

  it('retorna 400 quando o código é inválido', async () => {
    asAdmin();
    const res = await request(app)
      .post('/api/achievements')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ code: 'codigo invalido', title: 'X', description: 'Y' });
    expect(res.status).toBe(400);
  });

  it('retorna 409 quando o código já existe', async () => {
    asAdmin();
    const err = Object.assign(new Error('dup'), { code: 'P2002' });
    vi.mocked(prisma.achievement.create).mockRejectedValue(err);
    const res = await request(app)
      .post('/api/achievements')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ code: 'FIRST_LIST', title: 'Colecionador', description: 'desc' });
    expect(res.status).toBe(409);
  });
});

describe('PUT /api/achievements/:id', () => {
  it('edita conquista quando admin e retorna 200', async () => {
    asAdmin();
    vi.mocked(prisma.achievement.findUnique).mockResolvedValue(fakeAchievement as never);
    vi.mocked(prisma.achievement.update).mockResolvedValue({ ...fakeAchievement, title: 'Editada' } as never);
    const res = await request(app)
      .put('/api/achievements/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ code: 'FIRST_LIST', title: 'Editada', description: 'desc' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Editada');
  });

  it('retorna 404 quando a conquista não existe', async () => {
    asAdmin();
    vi.mocked(prisma.achievement.findUnique).mockResolvedValue(null as never);
    const res = await request(app)
      .put('/api/achievements/999')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ code: 'FIRST_LIST', title: 'X', description: 'Y' });
    expect(res.status).toBe(404);
  });

  it('retorna 400 quando o código é inválido', async () => {
    asAdmin();
    vi.mocked(prisma.achievement.findUnique).mockResolvedValue(fakeAchievement as never);
    const res = await request(app)
      .put('/api/achievements/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ code: 'bad code', title: 'X', description: 'Y' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/achievements/:id', () => {
  it('exclui conquista quando admin e retorna 204', async () => {
    asAdmin();
    vi.mocked(prisma.achievement.findUnique).mockResolvedValue(fakeAchievement as never);
    vi.mocked(prisma.achievement.delete).mockResolvedValue(fakeAchievement as never);
    const res = await request(app).delete('/api/achievements/1').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(204);
  });

  it('retorna 404 quando a conquista não existe', async () => {
    asAdmin();
    vi.mocked(prisma.achievement.findUnique).mockResolvedValue(null as never);
    const res = await request(app).delete('/api/achievements/999').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(404);
  });
});
