import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { UserGame, GameStatus } from '../../types';

const STATUS_LABELS: Record<GameStatus, string> = {
  backlog: 'Backlog',
  playing: 'Jogando',
  completed: 'Completado',
  dropped: 'Abandonado',
};

const STATUS_COLORS: Record<GameStatus, string> = {
  backlog: '#555',
  playing: '#3498db',
  completed: '#2ecc71',
  dropped: '#e74c3c',
};

export default function LibraryPage() {
  const [entries, setEntries] = useState<UserGame[]>([]);
  const [filter, setFilter] = useState<GameStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await api.get(`/api/library${params}`);
      setEntries(data);
    } catch {
      setError('Erro ao carregar biblioteca');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLibrary(); }, [filter]);

  const updateStatus = async (id: number, status: GameStatus) => {
    try {
      await api.put(`/api/library/${id}`, { status });
      fetchLibrary();
    } catch {
      setError('Erro ao atualizar status');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Remover jogo da biblioteca?')) return;
    try {
      await api.delete(`/api/library/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError('Erro ao remover');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Minha Biblioteca</h1>
      <div style={styles.filters}>
        {(['all', 'backlog', 'playing', 'completed', 'dropped'] as const).map((s) => (
          <button
            key={s}
            style={{ ...styles.filterBtn, ...(filter === s ? styles.activeFilter : {}) }}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {loading ? (
        <p style={{ color: '#aaa' }}>Carregando...</p>
      ) : entries.length === 0 ? (
        <p style={{ color: '#aaa' }}>Nenhum jogo encontrado. <a href="/explore">Explorar jogos</a></p>
      ) : (
        <div style={styles.list}>
          {entries.map((entry) => (
            <div key={entry.id} style={styles.card}>
              {entry.game.coverImage && (
                <img src={entry.game.coverImage} alt={entry.game.title} style={styles.cover} />
              )}
              <div style={styles.info}>
                <h3 style={styles.gameTitle}>{entry.game.title}</h3>
                <span style={{ ...styles.badge, background: STATUS_COLORS[entry.status] }}>
                  {STATUS_LABELS[entry.status]}
                </span>
                <select
                  style={styles.select}
                  value={entry.status}
                  onChange={(e) => updateStatus(entry.id, e.target.value as GameStatus)}
                >
                  {(Object.keys(STATUS_LABELS) as GameStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <button style={styles.removeBtn} onClick={() => remove(entry.id)}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  title: { color: '#e94560', marginBottom: '16px' },
  filters: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn: { padding: '8px 16px', background: '#16213e', color: '#eee', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' },
  activeFilter: { background: '#e94560', borderColor: '#e94560' },
  error: { background: '#e9456030', color: '#e94560', padding: '10px', borderRadius: '4px', marginBottom: '16px' },
  list: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  card: { background: '#16213e', borderRadius: '8px', overflow: 'hidden' },
  cover: { width: '100%', height: '140px', objectFit: 'cover' },
  info: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
  gameTitle: { color: '#eee', margin: 0, fontSize: '0.95rem' },
  badge: { padding: '2px 10px', borderRadius: '12px', color: '#fff', fontSize: '0.8rem', width: 'fit-content' },
  select: { padding: '6px', background: '#0f3460', color: '#eee', border: '1px solid #333', borderRadius: '4px' },
  removeBtn: { padding: '6px', background: 'transparent', color: '#e94560', border: '1px solid #e94560', borderRadius: '4px', cursor: 'pointer' },
};
