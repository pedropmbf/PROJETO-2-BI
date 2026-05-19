import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';

interface ResultState {
  score: number;
  totalQuestions: number;
  percentage: number;
  position: number;
  improved: boolean;
}

export default function QuizResultPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state as ResultState | null;

  if (!result) {
    navigate(`/quiz/${id}/play`);
    return null;
  }

  const { score, totalQuestions, percentage, position, improved } = result;

  const emoji = percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : percentage >= 40 ? '👍' : '📚';
  const message =
    percentage >= 90 ? 'Incrível! Você é um verdadeiro especialista!' :
    percentage >= 70 ? 'Muito bem! Você manja do assunto!' :
    percentage >= 40 ? 'Bom esforço! Ainda há espaço para melhorar.' :
    'Não desanime! Jogue de novo para aprender mais.';

  const barColor = percentage >= 70 ? '#2ecc71' : percentage >= 40 ? '#f39c12' : '#e94560';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.emojiSection}>{emoji}</div>

        <h1 style={styles.title}>Resultado</h1>
        <p style={styles.message}>{message}</p>

        <div style={styles.scoreBox}>
          <div style={styles.scoreMain}>
            <span style={{ ...styles.scoreNumber, color: barColor }}>{score}</span>
            <span style={styles.scoreTotal}>/{totalQuestions}</span>
          </div>
          <span style={{ ...styles.percentage, color: barColor }}>{percentage}% de acertos</span>

          <div style={styles.barBg}>
            <div style={{ ...styles.barFill, width: `${percentage}%`, background: barColor }} />
          </div>
        </div>

        <div style={styles.positionBox}>
          <span style={styles.positionLabel}>Sua posição no ranking</span>
          <span style={styles.positionValue}>#{position}</span>
          {improved && <span style={styles.improved}>↑ Novo recorde pessoal!</span>}
        </div>

        <div style={styles.actions}>
          <button style={styles.retryBtn} onClick={() => navigate(`/quiz/${id}/play`)}>
            Jogar Novamente
          </button>
          <Link to={`/quiz/${id}/ranking`} style={styles.rankBtn}>
            Ver Ranking
          </Link>
          <Link to="/quiz" style={styles.backBtn}>
            Outros Quizzes
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '500px', margin: '0 auto', display: 'flex', alignItems: 'center', minHeight: '80vh' },
  card: { background: '#16213e', borderRadius: '12px', padding: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
  emojiSection: { fontSize: '4rem', lineHeight: 1 },
  title: { color: '#eee', margin: 0, fontSize: '1.6rem' },
  message: { color: '#aaa', textAlign: 'center', margin: 0, lineHeight: '1.5' },
  scoreBox: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  scoreMain: { display: 'flex', alignItems: 'baseline', gap: '4px' },
  scoreNumber: { fontSize: '3.5rem', fontWeight: 'bold', lineHeight: 1 },
  scoreTotal: { color: '#555', fontSize: '1.5rem' },
  percentage: { fontSize: '1.1rem', fontWeight: 'bold' },
  barBg: { width: '100%', height: '10px', background: '#0f3460', borderRadius: '5px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '5px', transition: 'width 0.6s ease' },
  positionBox: { background: '#0f3460', borderRadius: '8px', padding: '16px 24px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  positionLabel: { color: '#888', fontSize: '0.85rem' },
  positionValue: { color: '#f1c40f', fontSize: '2rem', fontWeight: 'bold' },
  improved: { color: '#2ecc71', fontSize: '0.85rem' },
  actions: { display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' },
  retryBtn: { padding: '12px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  rankBtn: { padding: '12px', background: '#0f3460', color: '#eee', borderRadius: '6px', textDecoration: 'none', textAlign: 'center', fontWeight: 'bold' },
  backBtn: { padding: '12px', background: 'transparent', color: '#888', borderRadius: '6px', textDecoration: 'none', textAlign: 'center', border: '1px solid #333' },
};
