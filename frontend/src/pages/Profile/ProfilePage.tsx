import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/api/users/me')
      .then(({ data }) => {
        setProfile(data);
        setUsername(data.username);
        setAvatarUrl(data.avatarUrl || '');
      })
      .catch(() => setError('Erro ao carregar perfil'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const { data } = await api.put('/api/users/me', { username, avatarUrl: avatarUrl || null });
      setProfile((prev) => prev ? { ...prev, ...data } : prev);
      setSuccess('Perfil atualizado com sucesso!');
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar perfil');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt(
      'Esta ação é IRREVERSÍVEL. Sua conta, biblioteca, reviews, posts, comentários e quizzes serão excluídos.\n\nDigite "EXCLUIR" para confirmar:'
    );
    if (confirmation !== 'EXCLUIR') return;
    try {
      await api.delete('/api/users/me');
      logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir conta');
    }
  };

  if (loading) return <p style={{ color: '#aaa', padding: '24px' }}>Carregando...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Meu Perfil</h1>

      <div style={styles.card}>
        <div style={styles.avatarSection}>
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="avatar" style={styles.avatar} />
          ) : (
            <div style={styles.avatarPlaceholder}>
              {profile?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h2 style={styles.username}>{profile?.username}</h2>
            <p style={styles.email}>{profile?.email}</p>
            <p style={styles.since}>
              Membro desde {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-BR') : ''}
            </p>
          </div>
        </div>

        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{profile?._count?.userGames ?? 0}</span>
            <span style={styles.statLabel}>Jogos</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{profile?._count?.reviews ?? 0}</span>
            <span style={styles.statLabel}>Avaliações</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{profile?._count?.posts ?? 0}</span>
            <span style={styles.statLabel}>Posts</span>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {editing ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input style={styles.input} placeholder="Username" value={username}
              onChange={(e) => setUsername(e.target.value)} required />
            <input style={styles.input} placeholder="URL do avatar (opcional)" value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)} />
            <div style={styles.formActions}>
              <button style={styles.btn} type="submit">Salvar</button>
              <button style={styles.cancelBtn} type="button" onClick={() => setEditing(false)}>Cancelar</button>
            </div>
          </form>
        ) : (
          <button style={styles.btn} onClick={() => setEditing(true)}>Editar Perfil</button>
        )}
      </div>

      <div style={styles.dangerZone}>
        <h3 style={styles.dangerTitle}>Zona de Perigo</h3>
        <p style={styles.dangerText}>Excluir sua conta remove permanentemente todos os seus dados (biblioteca, reviews, posts, comentários e quizzes).</p>
        <button style={styles.dangerBtn} onClick={handleDeleteAccount}>Excluir minha conta</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '700px', margin: '0 auto' },
  title: { color: '#e94560', marginBottom: '20px' },
  card: { background: '#16213e', padding: '24px', borderRadius: '8px' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: { width: '80px', height: '80px', borderRadius: '50%', background: '#e94560', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#fff', fontWeight: 'bold' },
  username: { color: '#eee', margin: '0 0 4px' },
  email: { color: '#888', margin: '0 0 4px', fontSize: '0.9rem' },
  since: { color: '#666', margin: 0, fontSize: '0.8rem' },
  stats: { display: 'flex', gap: '24px', marginBottom: '24px', padding: '16px', background: '#0f3460', borderRadius: '6px' },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  statValue: { color: '#e94560', fontWeight: 'bold', fontSize: '1.4rem' },
  statLabel: { color: '#888', fontSize: '0.8rem' },
  error: { background: '#e9456030', color: '#e94560', padding: '10px', borderRadius: '4px', marginBottom: '16px' },
  success: { background: '#2ecc7130', color: '#2ecc71', padding: '10px', borderRadius: '4px', marginBottom: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '10px', background: '#0f3460', color: '#eee', border: '1px solid #333', borderRadius: '4px', fontSize: '1rem' },
  formActions: { display: 'flex', gap: '10px' },
  btn: { padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  cancelBtn: { padding: '10px 20px', background: 'transparent', color: '#aaa', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' },
  dangerZone: { marginTop: '32px', padding: '20px', border: '1px solid #e9456060', borderRadius: '8px', background: '#16213e' },
  dangerTitle: { color: '#e94560', margin: '0 0 8px', fontSize: '1.1rem' },
  dangerText: { color: '#888', fontSize: '0.85rem', margin: '0 0 16px', lineHeight: '1.5' },
  dangerBtn: { padding: '10px 20px', background: 'transparent', color: '#e94560', border: '1px solid #e94560', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
};
