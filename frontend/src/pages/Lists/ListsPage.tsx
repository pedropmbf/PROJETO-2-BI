import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { GameList } from '../../types';

export default function ListsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [publicLists, setPublicLists] = useState<GameList[]>([]);
  const [myLists, setMyLists] = useState<GameList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calls: Promise<unknown>[] = [
      api.get('/api/lists').then(({ data }) => setPublicLists(data)),
    ];
    if (isAuthenticated) {
      calls.push(api.get('/api/lists/mine').then(({ data }) => setMyLists(data)).catch(() => {}));
    }
    Promise.all(calls).finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Listas de Jogos</h1>
          <p style={styles.subtitle}>Coleções temáticas criadas pela comunidade</p>
        </div>
        {isAuthenticated && (
          <button style={styles.createBtn} onClick={() => navigate('/listas/criar')}>+ Nova Lista</button>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#aaa' }}>Carregando...</p>
      ) : (
        <>
          {isAuthenticated && (
            <section style={{ marginBottom: '40px' }}>
              <h2 style={styles.sectionTitle}>Minhas Listas</h2>
              {myLists.length === 0 ? (
                <p style={{ color: '#888' }}>Você ainda não criou nenhuma lista.</p>
              ) : (
                <div style={styles.grid}>
                  {myLists.map((l) => <ListCard key={l.id} list={l} owned />)}
                </div>
              )}
            </section>
          )}

          <section>
            <h2 style={styles.sectionTitle}>Listas Públicas</h2>
            {publicLists.length === 0 ? (
              <p style={{ color: '#888' }}>Nenhuma lista pública ainda.</p>
            ) : (
              <div style={styles.grid}>
                {publicLists.map((l) => <ListCard key={l.id} list={l} />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function ListCard({ list, owned }: { list: GameList; owned?: boolean }) {
  return (
    <Link to={`/listas/${list.id}`} style={styles.card}>
      <div style={styles.cardTop}>
        {!list.isPublic && <span style={styles.privateTag}>Privada</span>}
        <h3 style={styles.cardTitle}>{list.title}</h3>
        {list.description && <p style={styles.cardDesc}>{list.description}</p>}
      </div>
      <div style={styles.cardMeta}>
        <span style={styles.metaItem}>🎮 {list._count?.items ?? list.items?.length ?? 0} jogos</span>
        {!owned && list.user && <span style={styles.metaItem}>por {list.user.username}</span>}
      </div>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  title: { color: '#e94560', margin: '0 0 4px' },
  subtitle: { color: '#888', margin: 0 },
  createBtn: { padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' },
  sectionTitle: { color: '#eee', marginBottom: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  card: { background: '#16213e', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', textDecoration: 'none', minHeight: '120px' },
  cardTop: { flex: 1 },
  privateTag: { background: '#0f3460', color: '#aaa', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', display: 'inline-block', marginBottom: '6px' },
  cardTitle: { color: '#eee', margin: '0 0 6px', fontSize: '1.05rem' },
  cardDesc: { color: '#888', margin: 0, fontSize: '0.85rem', lineHeight: '1.4' },
  cardMeta: { display: 'flex', gap: '12px', justifyContent: 'space-between' },
  metaItem: { color: '#666', fontSize: '0.8rem' },
};
