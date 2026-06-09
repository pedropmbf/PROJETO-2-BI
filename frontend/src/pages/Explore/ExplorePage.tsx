import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Game } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function ExplorePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState<number | null>(null);
  const [success, setSuccess] = useState('');

  const search = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setGames([]);
    try {
      const { data } = await api.get(`/api/games/search?q=${encodeURIComponent(query)}`);
      setGames(data.results);
    } catch {
      setError('Erro ao buscar jogos');
    } finally {
      setLoading(false);
    }
  };

  const addToLibrary = async (game: Game) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAdding(game.rawgId);
    setSuccess('');
    try {
      await api.post('/api/library', { ...game, status: 'backlog' });
      setSuccess(`"${game.title}" adicionado ao backlog!`);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao adicionar'));
    } finally {
      setAdding(null);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Explorar Jogos</h1>
      <form onSubmit={search} style={styles.form}>
        <input
          style={styles.input}
          placeholder="Buscar jogo (ex: Zelda, GTA, Dark Souls...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.grid}>
        {games.map((game) => (
          <div key={game.rawgId} style={styles.card}>
            {game.coverImage && (
              <img src={game.coverImage} alt={game.title} style={styles.cover} />
            )}
            <div style={styles.info}>
              <h3 style={styles.gameTitle}>{game.title}</h3>
              {game.genre && <span style={styles.tag}>{game.genre}</span>}
              {game.metacriticScore && (
                <span style={{ ...styles.tag, background: '#2ecc71' }}>
                  MC: {game.metacriticScore}
                </span>
              )}
              <p style={styles.year}>{game.releasedAt?.slice(0, 4)}</p>
              <button
                style={styles.addBtn}
                onClick={() => addToLibrary(game)}
                disabled={adding === game.rawgId}
              >
                {adding === game.rawgId ? 'Adicionando...' : '+ Biblioteca'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  title: { color: '#e94560', marginBottom: '20px' },
  form: { display: 'flex', gap: '12px', marginBottom: '20px' },
  input: { flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #333', background: '#16213e', color: '#eee', fontSize: '1rem' },
  btn: { padding: '12px 24px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error: { background: '#e9456030', color: '#e94560', padding: '10px', borderRadius: '4px', marginBottom: '16px' },
  success: { background: '#2ecc7130', color: '#2ecc71', padding: '10px', borderRadius: '4px', marginBottom: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  card: { background: '#16213e', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cover: { width: '100%', height: '140px', objectFit: 'cover' },
  info: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  gameTitle: { color: '#eee', margin: 0, fontSize: '0.95rem' },
  tag: { background: '#0f3460', color: '#eee', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', width: 'fit-content' },
  year: { color: '#888', margin: 0, fontSize: '0.85rem' },
  addBtn: { marginTop: 'auto', padding: '8px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
};
