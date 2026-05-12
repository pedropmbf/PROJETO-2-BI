import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

const RAWG_BASE = 'https://api.rawg.io/api';

// UC04 - Buscar jogos por nome via RAWG API
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) {
      res.status(400).json({ error: 'Parâmetro q é obrigatório' });
      return;
    }

    const { data } = await axios.get(`${RAWG_BASE}/games`, {
      params: {
        key: process.env.RAWG_API_KEY,
        search: q,
        page,
        page_size: 20,
      },
    });

    const games = data.results.map((g: any) => ({
      rawgId: g.id,
      title: g.name,
      coverImage: g.background_image,
      genre: g.genres?.[0]?.name ?? null,
      releasedAt: g.released,
      metacriticScore: g.metacritic,
    }));

    res.json({ count: data.count, next: data.next, results: games });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar jogos na RAWG API' });
  }
});

// UC05 - Visualizar detalhes de um jogo
router.get('/:rawgId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rawgId } = req.params;
    const { data } = await axios.get(`${RAWG_BASE}/games/${rawgId}`, {
      params: { key: process.env.RAWG_API_KEY },
    });

    res.json({
      rawgId: data.id,
      title: data.name,
      coverImage: data.background_image,
      description: data.description_raw,
      genre: data.genres?.map((g: any) => g.name).join(', '),
      releasedAt: data.released,
      metacriticScore: data.metacritic,
      platforms: data.platforms?.map((p: any) => p.platform.name),
    });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar jogo na RAWG API' });
  }
});

export default router;
