import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import type { NewsPost } from '../../types';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/news/${id}`)
      .then(({ data }) => setNews(data))
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar notícia'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ color: '#aaa', padding: '24px' }}>Carregando...</p>;
  if (error) return <p style={{ color: '#e94560', padding: '24px' }}>{error}</p>;
  if (!news) return null;

  return (
    <div style={styles.container}>
      <Link to="/noticias" style={styles.back}>← Voltar para notícias</Link>
      {news.coverImage && <img src={news.coverImage} alt={news.title} style={styles.cover} />}
      <h1 style={styles.title}>{news.title}</h1>
      <span style={styles.meta}>
        {news.author ? `${news.author.username} · ` : ''}{new Date(news.createdAt).toLocaleDateString('pt-BR')}
      </span>
      {news.summary && <p style={styles.summary}>{news.summary}</p>}
      <div style={styles.content}>
        {news.content.split('\n').map((p, i) => <p key={i} style={{ margin: '0 0 12px' }}>{p}</p>)}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '760px', margin: '0 auto' },
  back: { color: '#888', textDecoration: 'none', fontSize: '0.9rem' },
  cover: { width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: '10px', margin: '16px 0' },
  title: { color: '#e94560', margin: '16px 0 8px' },
  meta: { color: '#666', fontSize: '0.85rem' },
  summary: { color: '#ccc', fontStyle: 'italic', margin: '16px 0', lineHeight: '1.5' },
  content: { color: '#ddd', lineHeight: '1.7', marginTop: '16px' },
};
