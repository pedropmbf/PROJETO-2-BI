import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { NewsPost } from '../../types';
import { getErrorMessage } from '../../utils/getErrorMessage';

const empty = { title: '', summary: '', content: '', coverImage: '', published: false };

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...empty });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchNews = () => {
    api.get('/api/news/admin/all')
      .then(({ data }) => setNews(data))
      .catch(() => setError('Erro ao carregar notícias'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchNews, []);

  const resetForm = () => { setForm({ ...empty }); setEditingId(null); setError(''); };

  const startEdit = (n: NewsPost) => {
    setEditingId(n.id);
    setForm({ title: n.title, summary: n.summary || '', content: n.content, coverImage: n.coverImage || '', published: n.published });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async () => {
    setError('');
    if (!form.title.trim() || !form.content.trim()) { setError('Título e conteúdo são obrigatórios'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/api/news/${editingId}`, form);
      } else {
        await api.post('/api/news', form);
      }
      resetForm();
      fetchNews();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Excluir esta notícia?')) return;
    try {
      await api.delete(`/api/news/${id}`);
      setNews((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao excluir'));
    }
  };

  return (
    <div style={styles.container}>
      <Link to="/admin" style={styles.back}>← Painel</Link>
      <h1 style={styles.title}>Gerenciar Notícias</h1>

      <div style={styles.formBox}>
        <h2 style={styles.formTitle}>{editingId ? 'Editar notícia' : 'Nova notícia'}</h2>
        <input style={styles.input} placeholder="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input style={styles.input} placeholder="Resumo (opcional)" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <input style={styles.input} placeholder="URL da imagem de capa (opcional)" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
        <textarea style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }} placeholder="Conteúdo *" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <label style={styles.checkboxRow}>
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Publicar (visível para todos)
        </label>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.formActions}>
          {editingId && <button style={styles.cancelBtn} onClick={resetForm} type="button">Cancelar edição</button>}
          <button style={styles.saveBtn} onClick={save} disabled={saving} type="button">
            {saving ? 'Salvando...' : (editingId ? 'Salvar alterações' : 'Criar notícia')}
          </button>
        </div>
      </div>

      <h2 style={styles.listTitle}>Todas as notícias</h2>
      {loading ? (
        <p style={{ color: '#aaa' }}>Carregando...</p>
      ) : (
        <div style={styles.list}>
          {news.map((n) => (
            <div key={n.id} style={styles.row}>
              <div style={{ flex: 1 }}>
                <span style={styles.rowTitle}>{n.title}</span>
                <span style={{ ...styles.statusTag, ...(n.published ? styles.publishedTag : styles.draftTag) }}>
                  {n.published ? 'Publicada' : 'Rascunho'}
                </span>
              </div>
              <button style={styles.editBtn} onClick={() => startEdit(n)}>Editar</button>
              <button style={styles.deleteBtn} onClick={() => remove(n.id)}>Excluir</button>
            </div>
          ))}
          {news.length === 0 && <p style={{ color: '#888' }}>Nenhuma notícia cadastrada.</p>}
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
  input: { padding: '10px', background: '#0f1626', color: '#eee', border: '1px solid #333', borderRadius: '4px', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', cursor: 'pointer' },
  error: { background: '#e9456030', color: '#e94560', padding: '10px', borderRadius: '4px' },
  formActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  cancelBtn: { padding: '10px 20px', background: 'transparent', color: '#aaa', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' },
  saveBtn: { padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  listTitle: { color: '#eee', marginBottom: '12px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  row: { background: '#16213e', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' },
  rowTitle: { color: '#eee', fontSize: '0.95rem', marginRight: '10px' },
  statusTag: { padding: '2px 10px', borderRadius: '12px', fontSize: '0.72rem' },
  publishedTag: { background: '#2ecc7130', color: '#2ecc71' },
  draftTag: { background: '#0f3460', color: '#aaa' },
  editBtn: { padding: '4px 12px', background: 'transparent', color: '#3498db', border: '1px solid #3498db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  deleteBtn: { padding: '4px 12px', background: 'transparent', color: '#e94560', border: '1px solid #e94560', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
};
