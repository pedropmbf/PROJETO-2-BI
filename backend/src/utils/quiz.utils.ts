export function calculateScore(
  questions: { id: number; correctIndex: number }[],
  answers: Record<number, number>
): number {
  return questions.reduce(
    (acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0),
    0
  );
}

export function validateRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 10;
}

export function validateQuizInput(
  title: string,
  questions: unknown[]
): string | null {
  if (!title?.trim()) return 'Título é obrigatório';
  if (!questions || questions.length < 3) return 'O quiz precisa de pelo menos 3 perguntas';

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i] as Record<string, unknown>;
    if (!(q.text as string)?.trim()) return `Pergunta ${i + 1}: texto obrigatório`;
    const opts = q.options as string[];
    if (!opts || opts.length !== 4 || opts.some((o) => !o?.trim()))
      return `Pergunta ${i + 1}: preencha todas as 4 alternativas`;
    const ci = q.correctIndex as number;
    if (ci < 0 || ci > 3) return `Pergunta ${i + 1}: marque a alternativa correta`;
  }

  return null;
}
