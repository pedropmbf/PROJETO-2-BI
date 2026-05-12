import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>GameLog</Link>
      <div style={styles.links}>
        <Link to="/explore" style={styles.link}>Explorar</Link>
        {isAuthenticated && (
          <>
            <Link to="/library" style={styles.link}>Biblioteca</Link>
            <Link to="/reviews" style={styles.link}>Avaliações</Link>
          </>
        )}
        <Link to="/forum" style={styles.link}>Fórum</Link>
        <Link to="/ranking" style={styles.link}>Ranking</Link>
        {isAuthenticated ? (
          <>
            <Link to="/profile" style={styles.link}>{user?.username}</Link>
            <button onClick={handleLogout} style={styles.btn}>Sair</button>
          </>
        ) : (
          <Link to="/login" style={{ ...styles.link, ...styles.btnLink }}>Entrar</Link>
        )}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: '#1a1a2e',
    borderBottom: '2px solid #e94560',
  },
  brand: {
    color: '#e94560',
    fontWeight: 'bold',
    fontSize: '1.4rem',
    textDecoration: 'none',
  },
  links: { display: 'flex', alignItems: 'center', gap: '16px' },
  link: { color: '#eee', textDecoration: 'none', fontSize: '0.95rem' },
  btn: {
    background: 'transparent',
    border: '1px solid #e94560',
    color: '#e94560',
    cursor: 'pointer',
    padding: '4px 12px',
    borderRadius: '4px',
  },
  btnLink: {
    background: '#e94560',
    color: '#fff',
    padding: '4px 14px',
    borderRadius: '4px',
  },
};
