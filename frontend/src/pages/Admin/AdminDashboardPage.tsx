import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Stats {
  users: number;
  quizzes: number;
  lists: number;
  news: number;
  achievements: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Painel Administrativo</h1>
      <p style={styles.subtitle}>Gerencie usuários, notícias e conquistas da plataforma</p>

      {loading ? (
        <p style={{ color: '#aaa' }}>Carregando...</p>
      ) : stats && (
        <div style={styles.statsGrid}>
          <Stat label="Usuários" value={stats.users} />
          <Stat label="Quizzes" value={stats.quizzes} />
          <Stat label="Listas" value={stats.lists} />
          <Stat label="Notícias" value={stats.news} />
          <Stat label="Conquistas" value={stats.achievements} />
        </div>
      )}

      <div style={styles.cards}>
        <Link to="/admin/usuarios" style={styles.navCard}>
          <span style={styles.navIcon}>👥</span>
          <div><h3 style={styles.navTitle}>Usuários</h3><p style={styles.navDesc}>Listar, promover e remover usuários</p></div>
        </Link>
        <Link to="/admin/noticias" style={styles.navCard}>
          <span style={styles.navIcon}>📰</span>
          <div><h3 style={styles.navTitle}>Notícias</h3><p style={styles.navDesc}>Criar, editar e publicar notícias</p></div>
        </Link>
        <Link to="/admin/conquistas" style={styles.navCard}>
          <span style={styles.navIcon}>🏆</span>
          <div><h3 style={styles.navTitle}>Conquistas</h3><p style={styles.navDesc}>Gerenciar as conquistas disponíveis</p></div>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '1000px', margin: '0 auto' },
  title: { color: '#f1c40f', margin: '0 0 4px' },
  subtitle: { color: '#888', margin: '0 0 24px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '32px' },
  statCard: { background: '#16213e', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  statValue: { color: '#e94560', fontSize: '2rem', fontWeight: 'bold' },
  statLabel: { color: '#aaa', fontSize: '0.85rem' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' },
  navCard: { background: '#16213e', borderRadius: '10px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'center', textDecoration: 'none', border: '1px solid #0f3460' },
  navIcon: { fontSize: '2rem' },
  navTitle: { color: '#eee', margin: '0 0 4px', fontSize: '1.05rem' },
  navDesc: { color: '#888', margin: 0, fontSize: '0.82rem' },
};
