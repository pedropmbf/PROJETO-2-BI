import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

interface RankingEntry {
  position: number;
  username: string;
  avatarUrl?: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

interface QuizInfo {
  id: number;
  title: string;
}

export default function QuizRankingPage() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<QuizInfo | null>(null);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, rankingRes] = await Promise.all([
          api.get(`/api/quizzes/${id}`),
          api.get(`/api/quizzes/${id}/ranking`),
        ]);
        setQuiz(quizRes.data);
        setRanking(rankingRes.data);
      } catch {
        setError('Erro ao carregar ranking');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const medalColor = (pos: number) => {
    if (pos === 1) return '#f1c40f';
    if (pos === 2) return '#bdc3c7';
    if (pos === 3) return '#e67e22';
    return '#0f3460';
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

  if (loading) return <p style={styles.info}>Carregando...</p>;
  if (error) return <p style={{ ...styles.info, color: '#e94560' }}>{error}</p>;

  return (
    <div style={styles.container}>
      <Link to={`/quiz/${id}/play`} style={styles.back}>← Voltar ao Quiz</Link>

      <h1 style={styles.title}>Ranking</h1>
      {quiz && <p style={styles.quizName}>{quiz.title}</p>}

      {ranking.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>Nenhum resultado ainda.</p>
          <p style={styles.emptyText}>Seja o primeiro a completar este quiz!</p>
          <Link to={`/quiz/${id}/play`} style={styles.playBtn}>Jogar agora</Link>
        </div>
      ) : (
        <div style={styles.list}>
          {ranking.map((entry) => {
            const pct = Math.round((entry.score / entry.totalQuestions) * 100);
            return (
              <div key={entry.position} style={styles.card}>
                <div style={{ ...styles.medal, background: medalColor(entry.position) }}>
                  #{entry.position}
                </div>

                <div style={styles.userInfo}>
                  {entry.avatarUrl ? (
                    <img src={entry.avatarUrl} alt="" style={styles.avatar} />
                  ) : (
                    <div style={styles.avatarPlaceholder}>
                      {entry.username[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span style={styles.username}>{entry.username}</span>
                    <span style={styles.date}>{formatDate(entry.completedAt)}</span>
                  </div>
                </div>

                <div style={styles.scoreSection}>
                  <span style={styles.score}>
                    {entry.score}/{entry.totalQuestions}
                  </span>
                  <div style={styles.barBg}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${pct}%`,
                        background: pct >= 70 ? '#2ecc71' : pct >= 40 ? '#f39c12' : '#e94560',
                      }}
                    />
                  </div>
                  <span style={styles.pct}>{pct}%</span>
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
  container: { padding: '24px', maxWidth: '700px', margin: '0 auto' },
  back: { color: '#888', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '16px' },
  title: { color: '#e94560', margin: '0 0 4px' },
  quizName: { color: '#aaa', margin: '0 0 24px', fontSize: '1rem' },
  info: { color: '#aaa', padding: '24px' },
  emptyBox: {
    background: '#16213e', padding: '40px', borderRadius: '8px',
    textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
  },
  emptyText: { color: '#aaa', margin: 0 },
  playBtn: {
    marginTop: '8px', padding: '10px 24px', background: '#e94560',
    color: '#fff', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: {
    background: '#16213e', padding: '16px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', gap: '16px',
  },
  medal: {
    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 'bold', fontSize: '0.8rem',
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  avatarPlaceholder: {
    width: '36px', height: '36px', borderRadius: '50%', background: '#e94560',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 'bold', flexShrink: 0,
  },
  username: { color: '#eee', fontWeight: 'bold', display: 'block', fontSize: '0.95rem' },
  date: { color: '#666', fontSize: '0.75rem', display: 'block' },
  scoreSection: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  score: { color: '#eee', fontWeight: 'bold', fontSize: '1rem', whiteSpace: 'nowrap' },
  barBg: { width: '80px', height: '6px', background: '#0f3460', borderRadius: '3px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  pct: { color: '#aaa', fontSize: '0.8rem', width: '36px', textAlign: 'right' },
};