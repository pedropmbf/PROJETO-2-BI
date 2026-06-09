import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';

vi.mock('../../lib/prisma', () => {
  const mock = {
    quiz: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    question: {
      deleteMany: vi.fn(),
    },
    userQuizResult: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { default: mock };
});

import prisma from '../../lib/prisma';

const USER_ID = 1;
const TOKEN = jwt.sign({ userId: USER_ID }, 'test-secret-key');

const fakeQuiz = {
  id: 1,
  title: 'GTA V — Você é fã de verdade?',
  description: 'Quiz sobre GTA V',
  coverImage: null,
  isOfficial: true,
  createdById: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: { username: 'admin' },
  _count: { questions: 10, results: 3 },
};

const fakeQuizWithQuestions = {
  ...fakeQuiz,
  questions: [
    { id: 1, text: 'Pergunta 1', options: ['A', 'B', 'C', 'D'] },
    { id: 2, text: 'Pergunta 2', options: ['A', 'B', 'C', 'D'] },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/quizzes', () => {
  // CT-18
  it('retorna lista de quizzes com status 200', async () => {
    vi.mocked(prisma.quiz.findMany).mockResolvedValue([fakeQuiz] as never);

    const res = await request(app).get('/api/quizzes');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe('GTA V — Você é fã de verdade?');
  });
});

describe('GET /api/quizzes/:id', () => {
  // CT-19
  it('retorna quiz com perguntas sem revelar correctIndex', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(fakeQuizWithQuestions as never);

    const res = await request(app).get('/api/quizzes/1');

    expect(res.status).toBe(200);
    expect(res.body.questions[0]).not.toHaveProperty('correctIndex');
    expect(res.body.questions[0]).toHaveProperty('options');
  });

  it('retorna 404 quando quiz não existe', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(null);

    const res = await request(app).get('/api/quizzes/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Quiz não encontrado');
  });
});

describe('POST /api/quizzes', () => {
  // CT-20
  it('retorna 400 quando há menos de 3 perguntas', async () => {
    const res = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({
        title: 'Meu Quiz',
        questions: [
          { text: 'P1', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
          { text: 'P2', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('O quiz precisa de pelo menos 3 perguntas');
  });

  it('retorna 400 quando título está vazio', async () => {
    const res = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({
        title: '',
        questions: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Título é obrigatório');
  });

  it('cria quiz com dados válidos e retorna 201', async () => {
    const createdQuiz = { ...fakeQuiz, isOfficial: false, _count: { questions: 3 } };
    vi.mocked(prisma.quiz.create).mockResolvedValue(createdQuiz as never);

    const questions = Array.from({ length: 3 }, (_, i) => ({
      text: `Pergunta ${i + 1}`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
    }));

    const res = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Meu Quiz Novo', questions });

    expect(res.status).toBe(201);
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app)
      .post('/api/quizzes')
      .send({ title: 'Teste', questions: [] });

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/quizzes/:id', () => {
  const ownQuiz = { ...fakeQuiz, isOfficial: false, createdById: USER_ID };
  const validQuestions = Array.from({ length: 3 }, (_, i) => ({
    text: `Pergunta ${i + 1}`,
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 0,
  }));

  // CT-21
  it('atualiza quiz próprio em transação e retorna 200', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(ownQuiz as never);
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) =>
      cb({
        question: { deleteMany: vi.fn().mockResolvedValue({ count: 3 }) },
        quiz: {
          update: vi.fn().mockResolvedValue({
            ...ownQuiz,
            title: 'Quiz Editado',
            _count: { questions: 3 },
          }),
        },
      })
    );

    const res = await request(app)
      .put('/api/quizzes/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Quiz Editado', questions: validQuestions });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Quiz Editado');
  });

  it('retorna 403 ao tentar editar quiz oficial', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue({ ...fakeQuiz, isOfficial: true } as never);

    const res = await request(app)
      .put('/api/quizzes/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Hack', questions: validQuestions });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Quizzes oficiais não podem ser editados');
  });

  it('retorna 403 quando usuário não é dono do quiz', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue({
      ...fakeQuiz,
      isOfficial: false,
      createdById: 999,
    } as never);

    const res = await request(app)
      .put('/api/quizzes/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Hack', questions: validQuestions });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Sem permissão');
  });

  it('retorna 404 quando quiz não existe', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/quizzes/999')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ title: 'Qualquer', questions: validQuestions });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/quizzes/:id/ranking', () => {
  it('retorna o ranking do quiz com status 200', async () => {
    vi.mocked(prisma.userQuizResult.findMany).mockResolvedValue([
      { user: { username: 'bob', avatarUrl: null }, score: 8, totalQuestions: 10, completedAt: new Date() },
    ] as never);
    const res = await request(app).get('/api/quizzes/1/ranking');
    expect(res.status).toBe(200);
    expect(res.body[0].position).toBe(1);
    expect(res.body[0].username).toBe('bob');
  });
});

describe('GET /api/quizzes/:id/edit', () => {
  const ownQuiz = {
    ...fakeQuiz,
    isOfficial: false,
    createdById: USER_ID,
    questions: [{ id: 1, text: 'P1', options: ['A', 'B', 'C', 'D'], correctIndex: 0 }],
  };

  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/quizzes/1/edit');
    expect(res.status).toBe(401);
  });

  it('retorna o quiz com correctIndex para o dono', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(ownQuiz as never);
    const res = await request(app).get('/api/quizzes/1/edit').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.body.questions[0]).toHaveProperty('correctIndex');
  });

  it('retorna 403 para quiz oficial', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue({ ...ownQuiz, isOfficial: true } as never);
    const res = await request(app).get('/api/quizzes/1/edit').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(403);
  });

  it('retorna 403 quando não é o dono', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue({ ...ownQuiz, createdById: 999 } as never);
    const res = await request(app).get('/api/quizzes/1/edit').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(403);
  });

  it('retorna 404 quando o quiz não existe', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(null as never);
    const res = await request(app).get('/api/quizzes/999/edit').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/quizzes/:id/submit', () => {
  const quizForSubmit = {
    id: 1,
    questions: [
      { id: 1, correctIndex: 0 },
      { id: 2, correctIndex: 1 },
    ],
  };

  it('retorna 401 sem token', async () => {
    const res = await request(app).post('/api/quizzes/1/submit').send({ answers: {} });
    expect(res.status).toBe(401);
  });

  it('calcula o score e retorna 200', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(quizForSubmit as never);
    vi.mocked(prisma.userQuizResult.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.userQuizResult.upsert).mockResolvedValue({} as never);
    vi.mocked(prisma.userQuizResult.count).mockResolvedValue(0 as never);

    const res = await request(app)
      .post('/api/quizzes/1/submit')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ answers: { 1: 0, 2: 1 } });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(2);
    expect(res.body.percentage).toBe(100);
    expect(res.body.position).toBe(1);
  });

  it('retorna 404 quando o quiz não existe', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(null as never);
    const res = await request(app)
      .post('/api/quizzes/999/submit')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ answers: {} });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/quizzes/:id', () => {
  const ownQuiz = { ...fakeQuiz, isOfficial: false, createdById: USER_ID };

  it('retorna 401 sem token', async () => {
    const res = await request(app).delete('/api/quizzes/1');
    expect(res.status).toBe(401);
  });

  it('exclui quiz próprio e retorna 204', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(ownQuiz as never);
    vi.mocked(prisma.quiz.delete).mockResolvedValue(ownQuiz as never);
    const res = await request(app).delete('/api/quizzes/1').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(204);
  });

  it('retorna 403 ao excluir quiz oficial', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue({ ...ownQuiz, isOfficial: true } as never);
    const res = await request(app).delete('/api/quizzes/1').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(403);
  });

  it('retorna 403 quando não é o dono', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue({ ...ownQuiz, createdById: 999 } as never);
    const res = await request(app).delete('/api/quizzes/1').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(403);
  });

  it('retorna 404 quando o quiz não existe', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(null as never);
    const res = await request(app).delete('/api/quizzes/999').set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(404);
  });
});
