import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { NewsPost } from '../../types';

export default function NewsPage() {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/news')
      .then(({ data }) => setNews(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Notícias</h1>
      <p style={styles.subtitle}>Novidades e atualizações da plataforma</p>

      {loading ? (
        <p style={{ color: '#aaa' }}>Carregando...</p>
      ) : news.length === 0 ? (
        <p style={{ color: '#888' }}>Nenhuma notícia publicada ainda.</p>
      ) : (
        <div style={styles.list}>
          {news.map((n) => (
            <Link key={n.id} to={`/noticias/${n.id}`} style={styles.card}>
              {n.coverImage && <img src={n.coverImage} alt={n.title} style={styles.cover} />}
              <div style={styles.body}>
                <h2 style={styles.cardTitle}>{n.title}</h2>
                {n.summary && <p style={styles.summary}>{n.summary}</p>}
                <span style={styles.meta}>
                  {n.author ? `${n.author.username} · ` : ''}{new Date(n.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '800px', margin: '0 auto' },
  title: { color: '#e94560', margin: '0 0 4px' },
  subtitle: { color: '#888', margin: '0 0 24px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: '#16213e', borderRadius: '10px', overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column' },
  cover: { width: '100%', height: '180px', objectFit: 'cover' },
  body: { padding: '16px' },
  cardTitle: { color: '#eee', margin: '0 0 8px', fontSize: '1.15rem' },
  summary: { color: '#aaa', margin: '0 0 8px', lineHeight: '1.5' },
  meta: { color: '#666', fontSize: '0.8rem' },
};
