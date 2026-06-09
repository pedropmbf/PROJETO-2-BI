import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { GameList } from '../../types';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<GameList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/lists/${id}`)
      .then(({ data }) => setList(data))
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar lista'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Excluir esta lista? Esta ação não pode ser desfeita.')) return;
    try {
      await api.delete(`/api/lists/${id}`);
      navigate('/listas');
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao excluir'));
    }
  };

  if (loading) return <p style={{ color: '#aaa', padding: '24px' }}>Carregando...</p>;
  if (error) return <p style={{ color: '#e94560', padding: '24px' }}>{error}</p>;
  if (!list) return null;

  const isOwner = user && list.user && user.username === list.user.username;

  return (
    <div style={styles.container}>
      <Link to="/listas" style={styles.back}>← Voltar</Link>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{list.title}</h1>
          {list.user && <p style={styles.author}>por {list.user.username}</p>}
          {list.description && <p style={styles.desc}>{list.description}</p>}
        </div>
        {isOwner && (
          <div style={styles.ownerActions}>
            <Link to={`/listas/${list.id}/editar`} style={styles.editBtn}>Editar</Link>
            <button type="button" style={styles.deleteBtn} onClick={handleDelete}>Excluir</button>
          </div>
        )}
      </div>

      <h2 style={styles.subtitle}>{list.items?.length ?? 0} jogos</h2>
      <div style={styles.grid}>
        {(list.items || []).map((item) => (
          <div key={item.id} style={styles.card}>
            {item.coverImage ? <img src={item.coverImage} alt={item.title} style={styles.cover} /> : <div style={styles.placeholder}>🎮</div>}
            <span style={styles.gameTitle}>{item.title}</span>
          </div>
        ))}
      </div>
      {(list.items?.length ?? 0) === 0 && <p style={{ color: '#888' }}>Esta lista ainda não tem jogos.</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '1100px', margin: '0 auto' },
  back: { color: '#888', textDecoration: 'none', fontSize: '0.9rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '16px 0 24px', gap: '16px' },
  title: { color: '#e94560', margin: '0 0 4px' },
  author: { color: '#888', margin: '0 0 8px', fontSize: '0.9rem' },
  desc: { color: '#ccc', margin: 0, lineHeight: '1.5' },
  ownerActions: { display: 'flex', gap: '8px', flexShrink: 0 },
  editBtn: { padding: '8px 16px', background: 'transparent', color: '#3498db', border: '1px solid #3498db', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem' },
  deleteBtn: { padding: '8px 16px', background: 'transparent', color: '#e94560', border: '1px solid #e94560', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  subtitle: { color: '#eee', marginBottom: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' },
  card: { background: '#16213e', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '8px' },
  cover: { width: '100%', height: '110px', objectFit: 'cover' },
  placeholder: { width: '100%', height: '110px', background: '#0f3460', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' },
  gameTitle: { color: '#eee', fontSize: '0.85rem', padding: '0 8px' },
};
