import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Quiz {
  id: number;
  title: string;
  description?: string;
  coverImage?: string;
  isOfficial: boolean;
  createdBy: { username: string };
  _count: { questions: number; results: number };
}

export default function QuizListPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/quizzes')
      .then(({ data }) => setQuizzes(data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (quizId: number) => {
    if (!confirm('Excluir este quiz? Esta ação não pode ser desfeita.')) return;
    try {
      await api.delete(`/api/quizzes/${quizId}`);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir quiz');
    }
  };

  const official = quizzes.filter((q) => q.isOfficial);
  const community = quizzes.filter((q) => !q.isOfficial);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Quizzes</h1>
          <p style={styles.subtitle}>Teste seus conhecimentos sobre seus jogos favoritos</p>
        </div>
        {isAuthenticated && (
          <button style={styles.createBtn} onClick={() => navigate('/quiz/criar')}>
            + Criar Quiz
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#aaa' }}>Carregando...</p>
      ) : (
        <>
          <section>
            <h2 style={styles.sectionTitle}>
              <span style={styles.badge}>Oficial</span> Quizzes GameLog
            </h2>
            <div style={styles.grid}>
              {official.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} currentUsername={user?.username} onDelete={handleDelete} />
              ))}
            </div>
          </section>

          {community.length > 0 && (
            <section style={{ marginTop: '40px' }}>
              <h2 style={styles.sectionTitle}>Da Comunidade</h2>
              <div style={styles.grid}>
                {community.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} currentUsername={user?.username} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}

          {community.length === 0 && !loading && (
            <div style={styles.emptyBox}>
              <p style={{ color: '#aaa', margin: 0 }}>Nenhum quiz da comunidade ainda.</p>
              {isAuthenticated
                ? <button style={styles.createBtn} onClick={() => navigate('/quiz/criar')}>Criar o primeiro!</button>
                : <Link to="/login" style={styles.loginLink}>Entre para criar um quiz</Link>
              }
            </div>
          )}
        </>
      )}
    </div>
  );
}

function QuizCard({ quiz, currentUsername, onDelete }: { quiz: Quiz; currentUsername?: string; onDelete: (id: number) => void }) {
  const isOwner = !quiz.isOfficial && currentUsername === quiz.createdBy.username;
  return (
    <div style={styles.card}>
      {quiz.coverImage ? (
        <img src={quiz.coverImage} alt={quiz.title} style={styles.cover} />
      ) : (
        <div style={styles.coverPlaceholder}>🎮</div>
      )}
      <div style={styles.cardBody}>
        <div style={styles.cardTop}>
          {quiz.isOfficial && <span style={styles.officialTag}>Oficial</span>}
          <h3 style={styles.cardTitle}>{quiz.title}</h3>
          {quiz.description && <p style={styles.cardDesc}>{quiz.description}</p>}
        </div>
        <div style={styles.cardMeta}>
          <span style={styles.metaItem}>📝 {quiz._count.questions} perguntas</span>
          <span style={styles.metaItem}>👥 {quiz._count.results} jogadas</span>
        </div>
        <div style={styles.cardActions}>
          <Link to={`/quiz/${quiz.id}/play`} style={styles.playBtn}>Jogar</Link>
          <Link to={`/quiz/${quiz.id}/ranking`} style={styles.rankBtn}>Ranking</Link>
        </div>
        {isOwner && (
          <div style={styles.ownerActions}>
            <Link to={`/quiz/${quiz.id}/editar`} style={styles.editBtn}>Editar</Link>
            <button type="button" style={styles.deleteBtn} onClick={() => onDelete(quiz.id)}>Excluir</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  title: { color: '#e94560', margin: '0 0 4px' },
  subtitle: { color: '#888', margin: 0 },
  createBtn: { padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' },
  sectionTitle: { color: '#eee', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { background: '#e94560', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { background: '#16213e', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cover: { width: '100%', height: '150px', objectFit: 'cover' },
  coverPlaceholder: { width: '100%', height: '150px', background: '#0f3460', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' },
  cardBody: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 },
  cardTop: { flex: 1 },
  officialTag: { background: '#e9456020', color: '#e94560', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', display: 'inline-block', marginBottom: '6px' },
  cardTitle: { color: '#eee', margin: '0 0 6px', fontSize: '1rem' },
  cardDesc: { color: '#888', margin: 0, fontSize: '0.85rem', lineHeight: '1.4' },
  cardMeta: { display: 'flex', gap: '12px' },
  metaItem: { color: '#666', fontSize: '0.8rem' },
  cardActions: { display: 'flex', gap: '8px' },
  playBtn: { flex: 1, padding: '10px', background: '#e94560', color: '#fff', borderRadius: '4px', textDecoration: 'none', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' },
  rankBtn: { padding: '10px 14px', background: '#0f3460', color: '#aaa', borderRadius: '4px', textDecoration: 'none', textAlign: 'center', fontSize: '0.9rem' },
  emptyBox: { marginTop: '24px', background: '#16213e', padding: '32px', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  loginLink: { color: '#e94560', textDecoration: 'none' },
  ownerActions: { display: 'flex', gap: '8px', marginTop: '4px' },
  editBtn: { flex: 1, padding: '8px', background: 'transparent', color: '#3498db', border: '1px solid #3498db', borderRadius: '4px', textDecoration: 'none', textAlign: 'center', fontSize: '0.85rem' },
  deleteBtn: { flex: 1, padding: '8px', background: 'transparent', color: '#e94560', border: '1px solid #e94560', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
};
