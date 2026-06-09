// Validações simples (retornam string de erro ou null) para os CRUDs de
// Listas, Notícias e Conquistas — mesmo padrão de validateQuizInput.

export function validateListInput(title: unknown): string | null {
  if (typeof title !== 'string' || !title.trim()) return 'Título é obrigatório';
  if (title.trim().length > 120) return 'Título deve ter no máximo 120 caracteres';
  return null;
}

export function validateNewsInput(title: unknown, content: unknown): string | null {
  if (typeof title !== 'string' || !title.trim()) return 'Título é obrigatório';
  if (typeof content !== 'string' || !content.trim()) return 'Conteúdo é obrigatório';
  return null;
}

export function validateAchievementInput(code: unknown, title: unknown, description: unknown): string | null {
  if (typeof code !== 'string' || !code.trim()) return 'Código é obrigatório';
  if (!/^[A-Z0-9_]+$/.test(code.trim())) return 'Código deve conter apenas letras maiúsculas, números e _';
  if (typeof title !== 'string' || !title.trim()) return 'Título é obrigatório';
  if (typeof description !== 'string' || !description.trim()) return 'Descrição é obrigatória';
  return null;
}
