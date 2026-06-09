import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from './auth.middleware';

// Deve rodar DEPOIS de authenticate. Busca o usuário no banco e verifica o papel,
// garantindo que promover/rebaixar tenha efeito imediato (sem depender do JWT antigo).
export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { role: true },
    });
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acesso restrito a administradores' });
      return;
    }
    next();
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
