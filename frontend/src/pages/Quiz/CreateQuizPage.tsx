import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface QuestionForm {
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
}

const emptyQuestion = (): QuestionForm => ({
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
});

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateQuestion = (qi: number, field: keyof QuestionForm, value: string | number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const options = [...q.options] as [string, string, string, string];
        options[oi] = value;
        return { ...q, options };
      })
    );
  };

  const addQuestion = () => {
    if (questions.length >= 20) return;
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (qi: number) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  };

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) { setError('Título é obrigatório'); return; }
    if (questions.length < 3) { setError('Adicione pelo menos 3 perguntas'); return; }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) { setError(`Pergunta ${i + 1}: texto obrigatório`); return; }
      if (q.options.some((o) => !o.trim())) {
        setError(`Pergunta ${i + 1}: preencha todas as alternativas`);
        return;
      }
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/quizzes', { title, description, questions });
      navigate(`/quiz/${data.id}/play`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Criar Quiz</h1>

      <div style={styles.section}>
        <label style={styles.label}>Título do Quiz *</label>
        <input
          style={styles.input}
          placeholder="Ex: Quiz de Minecraft"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Descrição (opcional)</label>
        <textarea
          style={{ ...styles.input, minHeight: '72px', resize: 'vertical' }}
          placeholder="Descreva o tema do quiz..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div style={styles.questionsHeader}>
        <h2 style={styles.subtitle}>Perguntas ({questions.length})</h2>
        <button style={styles.addBtn} onClick={addQuestion} type="button">
          + Pergunta
        </button>
      </div>

      {questions.map((q, qi) => (
        <div key={qi} style={styles.questionCard}>
          <div style={styles.questionHeader}>
            <span style={styles.questionNum}>Pergunta {qi + 1}</span>
            {questions.length > 1 && (
              <button style={styles.removeBtn} onClick={() => removeQuestion(qi)} type="button">
                Remover
              </button>
            )}
          </div>

          <input
            style={styles.input}
            placeholder="Texto da pergunta"
            value={q.text}
            onChange={(e) => updateQuestion(qi, 'text', e.target.value)}
          />

          <p style={styles.label}>Alternativas — clique no círculo para marcar a correta</p>
          {q.options.map((opt, oi) => (
            <div key={oi} style={styles.optionRow}>
              <button
                type="button"
                style={{
                  ...styles.radio,
                  ...(q.correctIndex === oi ? styles.radioSelected : {}),
                }}
                onClick={() => updateQuestion(qi, 'correctIndex', oi)}
                title="Marcar como correta"
              >
                {q.correctIndex === oi ? '✓' : String.fromCharCode(65 + oi)}
              </button>
              <input
                style={{ ...styles.input, margin: 0, flex: 1 }}
                placeholder={`Alternativa ${String.fromCharCode(65 + oi)}`}
                value={opt}
                onChange={(e) => updateOption(qi, oi, e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.actions}>
        <button style={styles.cancelBtn} onClick={() => navigate('/quiz')} type="button">
          Cancelar
        </button>
        <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading} type="button">
          {loading ? 'Criando...' : 'Criar Quiz'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '800px', margin: '0 auto' },
  title: { color: '#e94560', marginBottom: '24px' },
  subtitle: { color: '#eee', margin: 0 },
  section: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  label: { color: '#aaa', fontSize: '0.85rem', margin: '0 0 4px' },
  input: {
    padding: '10px', background: '#16213e', color: '#eee',
    border: '1px solid #333', borderRadius: '4px', fontSize: '0.95rem',
    width: '100%', boxSizing: 'border-box',
  },
  questionsHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px', marginTop: '8px',
  },
  addBtn: {
    padding: '8px 16px', background: '#0f3460', color: '#eee',
    border: '1px solid #333', borderRadius: '4px', cursor: 'pointer',
  },
  questionCard: {
    background: '#16213e', padding: '16px', borderRadius: '8px',
    marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
  },
  questionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  questionNum: { color: '#e94560', fontWeight: 'bold' },
  removeBtn: {
    background: 'transparent', border: '1px solid #e94560',
    color: '#e94560', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem',
  },
  optionRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  radio: {
    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
    background: '#0f3460', border: '2px solid #333', color: '#aaa',
    cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { background: '#2ecc71', borderColor: '#2ecc71', color: '#fff' },
  error: {
    background: '#e9456030', color: '#e94560', padding: '12px',
    borderRadius: '4px', marginBottom: '16px',
  },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn: {
    padding: '12px 24px', background: 'transparent', color: '#aaa',
    border: '1px solid #333', borderRadius: '4px', cursor: 'pointer',
  },
  submitBtn: {
    padding: '12px 24px', background: '#e94560', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
  },
};