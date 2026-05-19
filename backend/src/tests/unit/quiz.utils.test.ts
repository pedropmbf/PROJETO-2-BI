import { describe, it, expect } from 'vitest';
import { calculateScore, validateRating, validateQuizInput } from '../../utils/quiz.utils';

const makeQuestion = (id: number, correctIndex: number) => ({ id, correctIndex });
const makeFullQuestion = (n: number) => ({
  text: `Pergunta ${n}`,
  options: ['A', 'B', 'C', 'D'],
  correctIndex: 0,
});

describe('calculateScore', () => {
  it('retorna 0 quando todas as respostas estão erradas', () => {
    const questions = [makeQuestion(1, 0), makeQuestion(2, 1), makeQuestion(3, 2)];
    const answers = { 1: 3, 2: 3, 3: 3 };
    expect(calculateScore(questions, answers)).toBe(0);
  });

  it('retorna total quando todas as respostas estão corretas', () => {
    const questions = [makeQuestion(1, 0), makeQuestion(2, 1), makeQuestion(3, 2)];
    const answers = { 1: 0, 2: 1, 3: 2 };
    expect(calculateScore(questions, answers)).toBe(3);
  });

  it('conta apenas acertos parciais corretamente', () => {
    const questions = [makeQuestion(1, 0), makeQuestion(2, 1), makeQuestion(3, 2)];
    const answers = { 1: 0, 2: 3, 3: 2 };
    expect(calculateScore(questions, answers)).toBe(2);
  });
});

describe('validateRating', () => {
  it('aceita nota 1 (mínimo)', () => expect(validateRating(1)).toBe(true));
  it('aceita nota 10 (máximo)', () => expect(validateRating(10)).toBe(true));
  it('aceita nota intermediária', () => expect(validateRating(7)).toBe(true));

  // CT-11
  it('rejeita nota 0', () => expect(validateRating(0)).toBe(false));
  it('rejeita nota 11', () => expect(validateRating(11)).toBe(false));
  it('rejeita número decimal', () => expect(validateRating(5.5)).toBe(false));
});

describe('validateQuizInput', () => {
  it('retorna erro quando título está vazio', () => {
    expect(validateQuizInput('', [makeFullQuestion(1)])).toBe('Título é obrigatório');
  });

  it('retorna erro quando há menos de 3 perguntas', () => {
    const result = validateQuizInput('Meu Quiz', [makeFullQuestion(1), makeFullQuestion(2)]);
    expect(result).toBe('O quiz precisa de pelo menos 3 perguntas');
  });

  it('retorna erro quando pergunta tem texto vazio', () => {
    const qs = [
      { text: '', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
      makeFullQuestion(2),
      makeFullQuestion(3),
    ];
    expect(validateQuizInput('Quiz', qs)).toBe('Pergunta 1: texto obrigatório');
  });

  it('retorna erro quando alternativa está em branco', () => {
    const qs = [
      { text: 'Pergunta 1', options: ['A', '', 'C', 'D'], correctIndex: 0 },
      makeFullQuestion(2),
      makeFullQuestion(3),
    ];
    expect(validateQuizInput('Quiz', qs)).toBe('Pergunta 1: preencha todas as 4 alternativas');
  });

  it('retorna null quando tudo está válido', () => {
    const qs = [makeFullQuestion(1), makeFullQuestion(2), makeFullQuestion(3)];
    expect(validateQuizInput('Quiz Válido', qs)).toBeNull();
  });
});
