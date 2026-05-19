import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Response, NextFunction } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import type { AuthRequest } from '../../middlewares/auth.middleware';

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

import jwt from 'jsonwebtoken';

const mockRes = (): Response => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Middleware authenticate', () => {
  const next = vi.fn() as unknown as NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // CT-15
  it('rejeita requisição sem Authorization header com 401', () => {
    const req = { headers: {} } as AuthRequest;
    const res = mockRes();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejeita header sem prefixo Bearer com 401', () => {
    const req = { headers: { authorization: 'tokenSemBearer' } } as AuthRequest;
    const res = mockRes();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
  });

  it('rejeita token inválido ou expirado com 401', () => {
    const req = { headers: { authorization: 'Bearer token.invalido' } } as AuthRequest;
    const res = mockRes();
    vi.mocked(jwt.verify).mockImplementation(() => { throw new Error('invalid'); });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('aceita token válido, define req.userId e chama next()', () => {
    const req = { headers: { authorization: 'Bearer token.valido' } } as AuthRequest;
    const res = mockRes();
    vi.mocked(jwt.verify).mockReturnValue({ userId: 42 } as never);

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe(42);
  });
});
