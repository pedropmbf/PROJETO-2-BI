import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';

vi.mock('../../lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(), // requireAdmin + checagem de existência
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    quiz: { count: vi.fn() },
    gameList: { count: vi.fn() },
    newsPost: { count: vi.fn() },
    achievement: { count: vi.fn() },
  },
}));

import prisma from '../../lib/prisma';

const TOKEN = jwt.sign({ userId: 1 }, 'test-secret-key');

const asAdmin = () => vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never);
const asUser = () => vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'USER' } as never);
// requireAdmin (ADMIN) seguido de checagem de existência que retorna null -> 404
const adminThenMissing = () =>
  vi.mocked(prisma.user.findUnique)
    .mockResolvedValueOnce({ role: 'ADMIN' } as never)
    .mockResolvedValueOnce(null as never);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/admin/users', () => {
  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  it('retorna 403 para usuário comum', async () => {
    asUser();
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(403);
  });

  it('lista usuários quando admin e retorna 200', async () => {
    asAdmin();
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: 1, username: 'admin', email: 'a@a.com', role: 'ADMIN', createdAt: new Date(), _count: { quizzes: 0, gameLists: 0, reviews: 0 } },
    ] as never);
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/admin/stats', () => {
  it('retorna contagens quando admin', async () => {
    asAdmin();
    vi.mocked(prisma.user.count).mockResolvedValue(3 as never);
    vi.mocked(prisma.quiz.count).mockResolvedValue(5 as never);
    vi.mocked(prisma.gameList.count).mockResolvedValue(2 as never);
    vi.mocked(prisma.newsPost.count).mockResolvedValue(1 as never);
    vi.mocked(prisma.achievement.count).mockResolvedValue(5 as never);
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.body.users).toBe(3);
    expect(res.body.achievements).toBe(5);
  });
});

describe('PATCH /api/admin/users/:id/role', () => {
  it('altera o papel de outro usuário e retorna 200', async () => {
    asAdmin();
    vi.mocked(prisma.user.update).mockResolvedValue(
      { id: 2, username: 'bob', email: 'b@b.com', role: 'ADMIN' } as never
    );
    const res = await request(app)
      .patch('/api/admin/users/2/role')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ role: 'ADMIN' });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('ADMIN');
  });

  it('retorna 400 ao tentar alterar o próprio papel', async () => {
    asAdmin();
    const res = await request(app)
      .patch('/api/admin/users/1/role')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ role: 'USER' });
    expect(res.status).toBe(400);
  });

  it('retorna 400 quando o papel é inválido', async () => {
    asAdmin();
    const res = await request(app)
      .patch('/api/admin/users/2/role')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ role: 'SUPERADMIN' });
    expect(res.status).toBe(400);
  });

  it('retorna 404 quando o usuário não existe', async () => {
    adminThenMissing();
    const res = await request(app)
      .patch('/api/admin/users/999/role')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ role: 'ADMIN' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/users/:id', () => {
  it('exclui outro usuário e retorna 204', async () => {
    asAdmin();
    vi.mocked(prisma.user.delete).mockResolvedValue({ id: 2 } as never);
    const res = await request(app).delete('/api/admin/users/2').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(204);
  });

  it('retorna 400 ao tentar excluir a própria conta', async () => {
    asAdmin();
    const res = await request(app).delete('/api/admin/users/1').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(400);
  });

  it('retorna 404 quando o usuário não existe', async () => {
    adminThenMissing();
    const res = await request(app).delete('/api/admin/users/999').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(404);
  });
});
