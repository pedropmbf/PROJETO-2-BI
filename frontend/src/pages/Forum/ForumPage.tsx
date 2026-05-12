import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { ForumPost } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function ForumPage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/api/forum');
      setPosts(data);
    } catch {
      setError('Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/forum', { title, content });
      setTitle(''); setContent(''); setShowForm(false);
      fetchPosts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar post');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Fórum</h1>
        {isAuthenticated && (
          <button style={styles.btn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Novo Post'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} placeholder="Título do post" value={title}
            onChange={(e) => setTitle(e.target.value)} required />
          <textarea style={{ ...styles.input, minHeight: '120px' }} placeholder="Conteúdo..."
            value={content} onChange={(e) => setContent(e.target.value)} required />
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.btn} type="submit">Publicar</button>
        </form>
      )}

      {loading ? (
        <p style={{ color: '#aaa' }}>Carregando...</p>
      ) : (
        <div style={styles.list}>
          {posts.map((post) => (
            <Link key={post.id} to={`/forum/${post.id}`} style={styles.cardLink}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.postTitle}>{post.title}</h3>
                  {post.game && <span style={styles.gameBadge}>{post.game.title}</span>}
                </div>
                <p style={styles.excerpt}>
                  {post.content.length > 120 ? post.content.slice(0, 120) + '...' : post.content}
                </p>
                <div style={styles.meta}>
                  <span style={styles.author}>por {post.user.username}</span>
                  <span style={styles.date}>{formatDate(post.createdAt)}</span>
                  <span style={styles.comments}>{post._count?.comments ?? 0} comentários</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { color: '#e94560', margin: 0 },
  btn: { padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  form: { background: '#16213e', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  input: { padding: '10px', background: '#0f3460', color: '#eee', border: '1px solid #333', borderRadius: '4px', fontSize: '1rem', width: '100%', boxSizing: 'border-box' },
  error: { background: '#e9456030', color: '#e94560', padding: '10px', borderRadius: '4px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  cardLink: { textDecoration: 'none' },
  card: { background: '#16213e', padding: '16px', borderRadius: '8px', transition: 'background 0.2s' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  postTitle: { color: '#eee', margin: 0 },
  gameBadge: { background: '#e94560', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' },
  excerpt: { color: '#aaa', margin: '0 0 12px', fontSize: '0.9rem' },
  meta: { display: 'flex', gap: '16px', fontSize: '0.8rem' },
  author: { color: '#3498db' },
  date: { color: '#666' },
  comments: { color: '#888', marginLeft: 'auto' },
};
