import prisma from '../lib/prisma';

// Concede uma conquista a um usuário de forma idempotente (não duplica).
// Falhas são silenciadas para nunca quebrar a ação principal que disparou a concessão.
export async function grantAchievement(userId: number, code: string): Promise<void> {
  try {
    const achievement = await prisma.achievement.findUnique({ where: { code } });
    if (!achievement) return;
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
      update: {},
      create: { userId, achievementId: achievement.id },
    });
  } catch {
    // ignora: conquista é efeito colateral, não pode interromper o fluxo
  }
}
