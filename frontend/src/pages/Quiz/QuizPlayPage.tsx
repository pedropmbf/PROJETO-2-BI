import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Question {
  id: number;
  text: string;
  options: string[];
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  coverImage?: string;
  questions: Question[];
}

export default function QuizPlayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/api/quizzes/${id}`)
      .then(({ data }) => setQuiz(data))
      .catch(() => setError('Quiz não encontrado'))
      .finally(() => setLoading(false));
  }, [id]);

  if (!isAuthenticated) {
    return (
      <div style={styles.center}>
        <p style={{ color: '#aaa', marginBottom: '16px' }}>Você precisa estar logado para jogar.</p>
        <button style={styles.btn} onClick={() => navigate('/login')}>Entrar</button>
      </div>
    );
  }

  if (loading) return <p style={styles.info}>Carregando quiz...</p>;
  if (error || !quiz) return <p style={{ ...styles.info, color: '#e94560' }}>{error || 'Erro ao carregar'}</p>;

  const question = quiz.questions[current];
  const total = quiz.questions.length;
  const progress = ((current) / total) * 100;
  const isLast = current === total - 1;
  const allAnswered = Object.keys(answers).length === total;

  const selectOption = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setAnswers((prev) => ({ ...prev, [question.id]: idx }));
  };

  const next = () => {
    if (selected === null) return;
    setSelected(null);
    setCurrent((c) => c + 1);
  };

  const submit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/quizzes/${id}/submit`, { answers });
      navigate(`/quiz/${id}/resultado`, { state: data });
    } catch {
      setError('Erro ao enviar respostas. Tente novamente.');
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.quizHeader}>
        <h1 style={styles.title}>{quiz.title}</h1>
        <span style={styles.progress}>{current + 1} / {total}</span>
      </div>

      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      <div style={styles.card}>
        <p style={styles.questionText}>{question.text}</p>

        <div style={styles.options}>
          {question.options.map((opt, idx) => {
            const isSelected = selected === idx;
            return (
              <button
                key={idx}
                style={{
                  ...styles.option,
                  ...(isSelected ? styles.optionSelected : {}),
                  ...(selected !== null && !isSelected ? styles.optionDisabled : {}),
                }}
                onClick={() => selectOption(idx)}
                disabled={selected !== null}
              >
                <span style={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        <div style={styles.cardFooter}>
          {!isLast ? (
            <button
              style={{ ...styles.btn, opacity: selected === null ? 0.4 : 1 }}
              onClick={next}
              disabled={selected === null}
            >
              Próxima →
            </button>
          ) : (
            <button
              style={{ ...styles.btn, opacity: selected === null ? 0.4 : 1 }}
              onClick={submit}
              disabled={selected === null || submitting}
            >
              {submitting ? 'Enviando...' : 'Ver Resultado 🏁'}
            </button>
          )}
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '680px', margin: '0 auto' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  info: { color: '#aaa', padding: '24px' },
  quizHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  title: { color: '#e94560', margin: 0, fontSize: '1.2rem' },
  progress: { color: '#888', fontWeight: 'bold' },
  progressBar: { height: '6px', background: '#16213e', borderRadius: '3px', overflow: 'hidden', marginBottom: '24px' },
  progressFill: { height: '100%', background: '#e94560', borderRadius: '3px', transition: 'width 0.4s ease' },
  card: { background: '#16213e', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  questionText: { color: '#eee', fontSize: '1.15rem', lineHeight: '1.5', margin: 0, fontWeight: '500' },
  options: { display: 'flex', flexDirection: 'column', gap: '10px' },
  option: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '14px 16px', background: '#0f3460', color: '#eee',
    border: '2px solid transparent', borderRadius: '8px',
    cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem', transition: 'all 0.15s',
  },
  optionSelected: { borderColor: '#e94560', background: '#e9456015' },
  optionDisabled: { opacity: 0.5, cursor: 'default' },
  optionLetter: { background: '#1a1a2e', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 },
  cardFooter: { display: 'flex', justifyContent: 'flex-end' },
  btn: { padding: '12px 28px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  error: { background: '#e9456030', color: '#e94560', padding: '12px', borderRadius: '6px', marginTop: '16px' },
};
