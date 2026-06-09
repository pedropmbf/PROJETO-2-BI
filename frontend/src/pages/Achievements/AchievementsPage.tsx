import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Achievement } from '../../types';

export default function AchievementsPage() {
  const { isAuthenticated } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = isAuthenticated ? '/api/achievements/mine' : '/api/achievements';
    api.get(endpoint)
      .then(({ data }) => setAchievements(data))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Conquistas</h1>
      <p style={styles.subtitle}>
        {isAuthenticated
          ? `Você desbloqueou ${unlockedCount} de ${achievements.length} conquistas`
          : 'Entre na sua conta para acompanhar seu progresso'}
      </p>

      {loading ? (
        <p style={{ color: '#aaa' }}>Carregando...</p>
      ) : (
        <div style={styles.grid}>
          {achievements.map((a) => {
            const locked = isAuthenticated && !a.unlocked;
            return (
              <div key={a.id} style={{ ...styles.card, ...(locked ? styles.locked : {}) }}>
                <span style={styles.icon}>{a.icon || '🏆'}</span>
                <div style={styles.info}>
                  <h3 style={styles.cardTitle}>{a.title}</h3>
                  <p style={styles.desc}>{a.description}</p>
                  <div style={styles.footer}>
                    <span style={styles.points}>{a.points} pts</span>
                    {isAuthenticated && (
                      <span style={{ ...styles.status, color: a.unlocked ? '#2ecc71' : '#666' }}>
                        {a.unlocked ? '✓ Desbloqueada' : '🔒 Bloqueada'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
  title: { color: '#e94560', margin: '0 0 4px' },
  subtitle: { color: '#888', margin: '0 0 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card: { background: '#16213e', borderRadius: '10px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' },
  locked: { opacity: 0.55, filter: 'grayscale(0.6)' },
  icon: { fontSize: '2.2rem', lineHeight: 1 },
  info: { flex: 1 },
  cardTitle: { color: '#eee', margin: '0 0 4px', fontSize: '1rem' },
  desc: { color: '#aaa', margin: '0 0 10px', fontSize: '0.85rem', lineHeight: '1.4' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  points: { background: '#0f3460', color: '#f1c40f', padding: '2px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 'bold' },
  status: { fontSize: '0.78rem' },
};
