import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import type { Game } from '../../types';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface Props {
  mode?: 'create' | 'edit';
}

interface Item {
  rawgId: number;
  title: string;
  coverImage?: string;
}

export default function CreateListPage({ mode = 'create' }: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === 'edit';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(isEdit);

  // busca RAWG
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    api.get(`/api/lists/${id}/edit`)
      .then(({ data }) => {
        setTitle(data.title);
        setDescription(data.description || '');
        setIsPublic(data.isPublic);
        setItems((data.items || []).map((i: Item) => ({ rawgId: i.rawgId, title: i.title, coverImage: i.coverImage })));
      })
      .catch(() => setError('Erro ao carregar lista'))
      .finally(() => setLoadingList(false));
  }, [id, isEdit]);

  const search = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const { data } = await api.get(`/api/games/search?q=${encodeURIComponent(query)}`);
      setResults(data.results);
    } catch {
      setError('Erro ao buscar jogos');
    } finally {
      setSearching(false);
    }
  };

  const addItem = (g: Game) => {
    if (items.some((i) => i.rawgId === g.rawgId)) return;
    setItems((prev) => [...prev, { rawgId: g.rawgId, title: g.title, coverImage: g.coverImage }]);
  };

  const removeItem = (rawgId: number) => {
    setItems((prev) => prev.filter((i) => i.rawgId !== rawgId));
  };

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) { setError('Título é obrigatório'); return; }
    setLoading(true);
    try {
      const payload = { title, description, isPublic, items };
      if (isEdit && id) {
        await api.put(`/api/lists/${id}`, payload);
        navigate(`/listas/${id}`);
      } else {
        const { data } = await api.post('/api/lists', payload);
        navigate(`/listas/${data.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err, `Erro ao ${isEdit ? 'atualizar' : 'criar'} lista`));
    } finally {
      setLoading(false);
    }
  };

  if (loadingList) return <p style={{ color: '#aaa', padding: '24px' }}>Carregando lista...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{isEdit ? 'Editar Lista' : 'Criar Lista'}</h1>

      <div style={styles.section}>
        <label style={styles.label}>Título *</label>
        <input style={styles.input} placeholder="Ex: Top 10 RPGs" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Descrição (opcional)</label>
        <textarea style={{ ...styles.input, minHeight: '64px', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <label style={styles.checkboxRow}>
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        Lista pública (visível para todos)
      </label>

      <h2 style={styles.subtitle}>Jogos ({items.length})</h2>
      {items.length === 0 && <p style={{ color: '#888' }}>Nenhum jogo adicionado ainda. Busque abaixo para incluir.</p>}
      <div style={styles.itemsGrid}>
        {items.map((i) => (
          <div key={i.rawgId} style={styles.itemCard}>
            {i.coverImage ? <img src={i.coverImage} alt={i.title} style={styles.itemCover} /> : <div style={styles.itemPlaceholder}>🎮</div>}
            <span style={styles.itemTitle}>{i.title}</span>
            <button type="button" style={styles.removeItemBtn} onClick={() => removeItem(i.rawgId)}>Remover</button>
          </div>
        ))}
      </div>

      <form onSubmit={search} style={styles.searchForm}>
        <input style={styles.input} placeholder="Buscar jogo na RAWG..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <button style={styles.searchBtn} type="submit" disabled={searching}>{searching ? '...' : 'Buscar'}</button>
      </form>

      <div style={styles.itemsGrid}>
        {results.map((g) => (
          <div key={g.rawgId} style={styles.itemCard}>
            {g.coverImage ? <img src={g.coverImage} alt={g.title} style={styles.itemCover} /> : <div style={styles.itemPlaceholder}>🎮</div>}
            <span style={styles.itemTitle}>{g.title}</span>
            <button type="button" style={styles.addItemBtn} onClick={() => addItem(g)} disabled={items.some((i) => i.rawgId === g.rawgId)}>
              {items.some((i) => i.rawgId === g.rawgId) ? 'Adicionado' : '+ Adicionar'}
            </button>
          </div>
        ))}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.actions}>
        <button style={styles.cancelBtn} onClick={() => navigate('/listas')} type="button">Cancelar</button>
        <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading} type="button">
          {loading ? 'Salvando...' : (isEdit ? 'Salvar alterações' : 'Criar Lista')}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
  title: { color: '#e94560', marginBottom: '24px' },
  subtitle: { color: '#eee', margin: '24px 0 12px' },
  section: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  label: { color: '#aaa', fontSize: '0.85rem' },
  input: { padding: '10px', background: '#16213e', color: '#eee', border: '1px solid #333', borderRadius: '4px', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', marginBottom: '8px', cursor: 'pointer' },
  searchForm: { display: 'flex', gap: '12px', margin: '16px 0' },
  searchBtn: { padding: '10px 20px', background: '#0f3460', color: '#eee', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' },
  itemsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' },
  itemCard: { background: '#16213e', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px' },
  itemCover: { width: '100%', height: '90px', objectFit: 'cover', borderRadius: '4px' },
  itemPlaceholder: { width: '100%', height: '90px', background: '#0f3460', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', borderRadius: '4px' },
  itemTitle: { color: '#eee', fontSize: '0.8rem', flex: 1 },
  addItemBtn: { padding: '6px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem' },
  removeItemBtn: { padding: '6px', background: 'transparent', color: '#e94560', border: '1px solid #e94560', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem' },
  error: { background: '#e9456030', color: '#e94560', padding: '12px', borderRadius: '4px', margin: '16px 0' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' },
  cancelBtn: { padding: '12px 24px', background: 'transparent', color: '#aaa', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' },
  submitBtn: { padding: '12px 24px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
};
