import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Response } from 'express';

vi.mock('../../lib/prisma', () => ({
  default: {
    user: { findUnique: vi.fn() },
  },
}));

import prisma from '../../lib/prisma';
import { requireAdmin } from '../../middlewares/admin.middleware';
import type { AuthRequest } from '../../middlewares/auth.middleware';

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('requireAdmin', () => {
  it('chama next() quando o usuário é ADMIN', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as never);
    const req = { userId: 1 } as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    await requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('retorna 403 quando o usuário é comum (USER)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'USER' } as never);
    const req = { userId: 2 } as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    await requireAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('retorna 403 quando o usuário não existe', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    const req = { userId: 99 } as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    await requireAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
