import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { AdminUser } from '../../types';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = () => {
    api.get('/api/admin/users')
      .then(({ data }) => setUsers(data))
      .catch(() => setError('Erro ao carregar usuários'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchUsers, []);

  const changeRole = async (id: number, role: 'USER' | 'ADMIN') => {
    try {
      await api.patch(`/api/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao alterar papel'));
    }
  };

  const removeUser = async (id: number) => {
    if (!confirm('Excluir este usuário? Todos os dados dele serão removidos.')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao excluir'));
    }
  };

  return (
    <div style={styles.container}>
      <Link to="/admin" style={styles.back}>← Painel</Link>
      <h1 style={styles.title}>Usuários</h1>
      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p style={{ color: '#aaa' }}>Carregando...</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Usuário</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Papel</th>
                <th style={styles.th}>Conteúdo</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === user?.id;
                return (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>{u.username}{isSelf && <span style={styles.youTag}>você</span>}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.roleTag, ...(u.role === 'ADMIN' ? styles.adminTag : {}) }}>{u.role}</span>
                    </td>
                    <td style={styles.tdMuted}>
                      {u._count ? `${u._count.quizzes}Q · ${u._count.gameLists}L · ${u._count.reviews}A` : '-'}
                    </td>
                    <td style={styles.td}>
                      {!isSelf && (
                        <div style={styles.actions}>
                          {u.role === 'USER' ? (
                            <button style={styles.promoteBtn} onClick={() => changeRole(u.id, 'ADMIN')}>Promover</button>
                          ) : (
                            <button style={styles.demoteBtn} onClick={() => changeRole(u.id, 'USER')}>Rebaixar</button>
                          )}
                          <button style={styles.deleteBtn} onClick={() => removeUser(u.id)}>Excluir</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '1000px', margin: '0 auto' },
  back: { color: '#888', textDecoration: 'none', fontSize: '0.9rem' },
  title: { color: '#f1c40f', margin: '12px 0 24px' },
  error: { background: '#e9456030', color: '#e94560', padding: '12px', borderRadius: '4px', marginBottom: '16px' },
  tableWrap: { overflowX: 'auto', background: '#16213e', borderRadius: '10px' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '640px' },
  th: { textAlign: 'left', padding: '12px 16px', color: '#888', fontSize: '0.8rem', borderBottom: '1px solid #0f3460', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #0f3460' },
  td: { padding: '12px 16px', color: '#eee', fontSize: '0.9rem' },
  tdMuted: { padding: '12px 16px', color: '#888', fontSize: '0.82rem' },
  youTag: { marginLeft: '6px', background: '#0f3460', color: '#aaa', padding: '1px 6px', borderRadius: '8px', fontSize: '0.7rem' },
  roleTag: { background: '#0f3460', color: '#aaa', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem' },
  adminTag: { background: '#f1c40f30', color: '#f1c40f', fontWeight: 'bold' },
  actions: { display: 'flex', gap: '8px' },
  promoteBtn: { padding: '4px 10px', background: 'transparent', color: '#2ecc71', border: '1px solid #2ecc71', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  demoteBtn: { padding: '4px 10px', background: 'transparent', color: '#f39c12', border: '1px solid #f39c12', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  deleteBtn: { padding: '4px 10px', background: 'transparent', color: '#e94560', border: '1px solid #e94560', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
};
