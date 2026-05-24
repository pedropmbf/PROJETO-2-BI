import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import axios from 'axios';

vi.mock('axios');
vi.mock('../../lib/prisma', () => ({ default: {} }));

import app from '../../app';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/games/search', () => {
  // CT-05
  it('retorna jogos mapeados do RAWG com status 200', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        count: 1,
        next: null,
        results: [
          {
            id: 5638,
            name: 'The Legend of Zelda: Breath of the Wild',
            background_image: 'https://img.example/zelda.jpg',
            genres: [{ name: 'Action' }],
            released: '2017-03-03',
            metacritic: 97,
          },
        ],
      },
    });

    const res = await request(app).get('/api/games/search?q=zelda');

    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0]).toMatchObject({
      rawgId: 5638,
      title: 'The Legend of Zelda: Breath of the Wild',
      genre: 'Action',
      metacriticScore: 97,
    });
  });

  it('retorna 400 quando parâmetro q ausente', async () => {
    const res = await request(app).get('/api/games/search');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Parâmetro q é obrigatório');
  });

  it('retorna 500 quando RAWG falha', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('Network'));

    const res = await request(app).get('/api/games/search?q=any');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Erro ao buscar jogos na RAWG API');
  });

  it('mapeia gênero como null quando ausente', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        count: 0, next: null,
        results: [{ id: 1, name: 'Sem gênero', background_image: null, genres: [], released: null, metacritic: null }],
      },
    });

    const res = await request(app).get('/api/games/search?q=qq');

    expect(res.status).toBe(200);
    expect(res.body.results[0].genre).toBeNull();
  });
});

describe('GET /api/games/:rawgId', () => {
  it('retorna detalhe do jogo com plataformas e gêneros', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        id: 5638,
        name: 'Zelda',
        background_image: 'https://x',
        description_raw: 'descrição',
        genres: [{ name: 'Action' }, { name: 'Adventure' }],
        released: '2017-03-03',
        metacritic: 97,
        platforms: [{ platform: { name: 'Switch' } }],
      },
    });

    const res = await request(app).get('/api/games/5638');

    expect(res.status).toBe(200);
    expect(res.body.rawgId).toBe(5638);
    expect(res.body.genre).toBe('Action, Adventure');
    expect(res.body.platforms).toEqual(['Switch']);
  });

  it('retorna 500 quando RAWG falha no detalhe', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('Network'));

    const res = await request(app).get('/api/games/999');

    expect(res.status).toBe(500);
  });
});
