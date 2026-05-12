import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { RankingEntry } from '../../types';

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/ranking')
      .then(({ data }) => setRanking(data))
      .catch(() => setError('Erro ao carregar ranking'))
      .finally(() => setLoading(false));
  }, []);

  const medalColor = (pos: number) => {
    if (pos === 1) return '#f1c40f';
    if (pos === 2) return '#bdc3c7';
    if (pos === 3) return '#e67e22';
    return '#555';
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Ranking de Jogadores</h1>
      <p style={styles.subtitle}>Classificação por jogos completados</p>

      {error && <div style={styles.error}>{error}</div>}
      {loading ? (
        <p style={{ color: '#aaa' }}>Carregando...</p>
      ) : ranking.length === 0 ? (
        <p style={{ color: '#aaa' }}>Nenhum jogador no ranking ainda.</p>
      ) : (
        <div style={styles.list}>
          {ranking.map((entry) => (
            <div key={entry.userId} style={styles.card}>
              <div style={{ ...styles.position, background: medalColor(entry.position) }}>
                #{entry.position}
              </div>
              <div style={styles.info}>
                <span style={styles.username}>{entry.username}</span>
                <span style={styles.stat}>{entry.completedGames} jogos completados</span>
                {entry.avgCompletion > 0 && (
                  <span style={styles.stat}>Média de conclusão: {entry.avgCompletion}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '700px', margin: '0 auto' },
  title: { color: '#e94560', marginBottom: '4px' },
  subtitle: { color: '#888', marginBottom: '24px' },
  error: { background: '#e9456030', color: '#e94560', padding: '10px', borderRadius: '4px', marginBottom: '16px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { background: '#16213e', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' },
  position: { width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0 },
  info: { display: 'flex', flexDirection: 'column', gap: '4px' },
  username: { color: '#eee', fontWeight: 'bold', fontSize: '1.05rem' },
  stat: { color: '#888', fontSize: '0.85rem' },
};
