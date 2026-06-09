import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { Achievement } from '../../types';
import { getErrorMessage } from '../../utils/getErrorMessage';

const empty = { code: '', title: '', description: '', icon: '', points: 0 };

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...empty });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAll = () => {
    api.get('/api/achievements')
      .then(({ data }) => setAchievements(data))
      .catch(() => setError('Erro ao carregar conquistas'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchAll, []);

  const resetForm = () => { setForm({ ...empty }); setEditingId(null); setError(''); };

  const startEdit = (a: Achievement) => {
    setEditingId(a.id);
    setForm({ code: a.code, title: a.title, description: a.description, icon: a.icon || '', points: a.points });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async () => {
    setError('');
    if (!form.code.trim() || !form.title.trim() || !form.description.trim()) {
      setError('Código, título e descrição são obrigatórios');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, points: Number(form.points) || 0 };
      if (editingId) {
        await api.put(`/api/achievements/${editingId}`, payload);
      } else {
        await api.post('/api/achievements', payload);
      }
      resetForm();
      fetchAll();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Excluir esta conquista?')) return;
    try {
      await api.delete(`/api/achievements/${id}`);
      setAchievements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao excluir'));
    }
  };

  return (
    <div style={styles.container}>
      <Link to="/admin" style={styles.back}>← Painel</Link>
      <h1 style={styles.title}>Gerenciar Conquistas</h1>

      <div style={styles.formBox}>
        <h2 style={styles.formTitle}>{editingId ? 'Editar conquista' : 'Nova conquista'}</h2>
        <div style={styles.formRow}>
          <input style={styles.input} placeholder="CÓDIGO (ex: FIRST_LIST)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <input style={{ ...styles.input, maxWidth: '90px' }} placeholder="Ícone" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <input style={{ ...styles.input, maxWidth: '90px' }} type="number" placeholder="Pontos" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
        </div>
        <input style={styles.input} placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea style={{ ...styles.input, minHeight: '70px', resize: 'vertical' }} placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.formActions}>
          {editingId && <button style={styles.cancelBtn} onClick={resetForm} type="button">Cancelar edição</button>}
          <button style={styles.saveBtn} onClick={save} disabled={saving} type="button">
            {saving ? 'Salvando...' : (editingId ? 'Salvar alterações' : 'Criar conquista')}
          </button>
        </div>
      </div>

      <h2 style={styles.listTitle}>Conquistas cadastradas</h2>
      {loading ? (
        <p style={{ color: '#aaa' }}>Carregando...</p>
      ) : (
        <div style={styles.list}>
          {achievements.map((a) => (
            <div key={a.id} style={styles.row}>
              <span style={styles.rowIcon}>{a.icon || '🏆'}</span>
              <div style={{ flex: 1 }}>
                <span style={styles.rowTitle}>{a.title}</span>
                <span style={styles.code}>{a.code}</span>
                <p style={styles.rowDesc}>{a.description}</p>
              </div>
              <span style={styles.points}>{a.points} pts</span>
              <button style={styles.editBtn} onClick={() => startEdit(a)}>Editar</button>
              <button style={styles.deleteBtn} onClick={() => remove(a.id)}>Excluir</button>
            </div>
          ))}
          {achievements.length === 0 && <p style={{ color: '#888' }}>Nenhuma conquista cadastrada.</p>}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '800px', margin: '0 auto' },
  back: { color: '#888', textDecoration: 'none', fontSize: '0.9rem' },
  title: { color: '#f1c40f', margin: '12px 0 24px' },
  formBox: { background: '#16213e', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' },
  formTitle: { color: '#eee', margin: '0 0 4px' },
  formRow: { display: 'flex', gap: '10px' },
  input: { padding: '10px', background: '#0f1626', color: '#eee', border: '1px solid #333', borderRadius: '4px', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
  error: { background: '#e9456030', color: '#e94560', padding: '10px', borderRadius: '4px' },
  formActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  cancelBtn: { padding: '10px 20px', background: 'transparent', color: '#aaa', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' },
  saveBtn: { padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  listTitle: { color: '#eee', marginBottom: '12px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  row: { background: '#16213e', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' },
  rowIcon: { fontSize: '1.6rem' },
  rowTitle: { color: '#eee', fontSize: '0.95rem', marginRight: '8px' },
  code: { color: '#888', fontSize: '0.72rem', background: '#0f3460', padding: '1px 6px', borderRadius: '6px' },
  rowDesc: { color: '#aaa', margin: '4px 0 0', fontSize: '0.8rem' },
  points: { color: '#f1c40f', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' },
  editBtn: { padding: '4px 12px', background: 'transparent', color: '#3498db', border: '1px solid #3498db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  deleteBtn: { padding: '4px 12px', background: 'transparent', color: '#e94560', border: '1px solid #e94560', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
};
