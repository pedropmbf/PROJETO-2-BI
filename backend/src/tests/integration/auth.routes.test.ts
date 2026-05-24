import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

vi.mock('../../lib/prisma', () => ({
  default: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('fake-jwt-token'),
    verify: vi.fn(),
  },
}));

import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';

const fakeUser = {
  id: 1,
  username: 'gamer01',
  email: 'gamer01@test.com',
  passwordHash: 'hashed_password',
  avatarUrl: null,
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/auth/register', () => {
  // CT-01
  it('cria usuário com dados válidos e retorna 201 com token', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(fakeUser);

    const res = await request(app).post('/api/auth/register').send({
      username: 'gamer01',
      email: 'gamer01@test.com',
      password: 'senha123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('gamer01@test.com');
  });

  // CT-02
  it('retorna 409 quando email ou username já existe', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(fakeUser);

    const res = await request(app).post('/api/auth/register').send({
      username: 'outro',
      email: 'gamer01@test.com',
      password: 'senha123',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email ou username já em uso');
  });

  // CT-01b
  it('retorna 400 quando campos obrigatórios estão ausentes', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  // CT-03
  it('autentica com credenciais válidas e retorna 200 com token', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(fakeUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const res = await request(app).post('/api/auth/login').send({
      email: 'gamer01@test.com',
      password: 'senha123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.id).toBe(1);
  });

  // CT-04
  it('retorna 401 com senha incorreta', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(fakeUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const res = await request(app).post('/api/auth/login').send({
      email: 'gamer01@test.com',
      password: 'senhaerrada',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciais inválidas');
  });

  // CT-04b
  it('retorna 401 quando usuário não existe', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'naoexiste@test.com',
      password: 'qualquer',
    });

    expect(res.status).toBe(401);
  });
});
