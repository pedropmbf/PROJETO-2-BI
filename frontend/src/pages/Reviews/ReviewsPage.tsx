import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import api from '../../services/api';
import type { Review, Game, UserGame } from '../../types';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface SelectedGame {
  rawgId: number;
  title: string;
  coverImage?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // game picker state
  const [pickerTab, setPickerTab] = useState<'library' | 'search'>('library');
  const [libraryGames, setLibraryGames] = useState<UserGame[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<SelectedGame | null>(null);

  // review form state
  const [rating, setRating] = useState('8');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const fetchMyReviews = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/reviews/mine');
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLibrary = async () => {
    try {
      const { data } = await api.get('/api/library');
      setLibraryGames(data);
    } catch {
      setLibraryGames([]);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect -- carregamento inicial dos dados
  useEffect(() => { fetchMyReviews(); fetchLibrary(); }, []);

  const searchGames = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);
    try {
      const { data } = await api.get(`/api/games/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data.results);
    } catch {
      setError('Erro ao buscar jogos');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGame) { setError('Selecione um jogo'); return; }
    setError('');
    try {
      if (editingId) {
        const { data } = await api.put(`/api/reviews/${editingId}`, {
          rating: Number(rating), title, content,
        });
        setReviews((prev) => prev.map((r) => (r.id === editingId ? data : r)));
      } else {
        const { data } = await api.post('/api/reviews', {
          rawgId: selectedGame.rawgId,
          gameTitle: selectedGame.title,
          gameCover: selectedGame.coverImage,
          rating: Number(rating),
          title,
          content,
        });
        setReviews((prev) => [data, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar avaliação'));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedGame(null);
    setSearchQuery('');
    setSearchResults([]);
    setRating('8');
    setTitle('');
    setContent('');
    setError('');
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setRating(String(review.rating));
    setTitle(review.title);
    setContent(review.content);
    setSelectedGame({ rawgId: 0, title: 'Avaliação existente' });
    setShowForm(true);
  };

  const deleteReview = async (id: number) => {
    if (!confirm('Excluir avaliação?')) return;
    try {
      await api.delete(`/api/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('Erro ao excluir');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Minhas Avaliações</h1>
        <button style={styles.btn} onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
          {showForm ? 'Cancelar' : '+ Nova Avaliação'}
        </button>
      </div>

      {showForm && (
        <div style={styles.form}>
          {!editingId && (
            <>
              <p style={styles.label}>Selecione o jogo</p>
              <div style={styles.tabs}>
                <button
                  style={{ ...styles.tab, ...(pickerTab === 'library' ? styles.activeTab : {}) }}
                  onClick={() => setPickerTab('library')}
                  type="button"
                >
                  Da minha biblioteca
                </button>
                <button
                  style={{ ...styles.tab, ...(pickerTab === 'search' ? styles.activeTab : {}) }}
                  onClick={() => setPickerTab('search')}
                  type="button"
                >
                  Buscar jogo
                </button>
              </div>

              {pickerTab === 'library' ? (
                <div style={styles.gameList}>
                  {libraryGames.length === 0 ? (
                    <p style={{ color: '#888', padding: '12px' }}>Sua biblioteca está vazia. <a href="/explore">Adicione jogos</a></p>
                  ) : (
                    libraryGames.map((ug) => (
                      <div
                        key={ug.id}
                        style={{
                          ...styles.gameItem,
                          ...(selectedGame?.rawgId === ug.game.rawgId ? styles.gameItemSelected : {}),
                        }}
                        onClick={() => setSelectedGame({ rawgId: ug.game.rawgId, title: ug.game.title, coverImage: ug.game.coverImage })}
                      >
                        {ug.game.coverImage && <img src={ug.game.coverImage} alt="" style={styles.gameCover} />}
                        <span style={styles.gameItemTitle}>{ug.game.title}</span>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <>
                  <form onSubmit={searchGames} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      style={{ ...styles.input, flex: 1 }}
                      placeholder="Ex: Elden Ring, GTA V..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button style={styles.btn} type="submit" disabled={searchLoading}>
                      {searchLoading ? '...' : 'Buscar'}
                    </button>
                  </form>
                  <div style={styles.gameList}>
                    {searchResults.map((game) => (
                      <div
                        key={game.rawgId}
                        style={{
                          ...styles.gameItem,
                          ...(selectedGame?.rawgId === game.rawgId ? styles.gameItemSelected : {}),
                        }}
                        onClick={() => setSelectedGame({ rawgId: game.rawgId, title: game.title, coverImage: game.coverImage })}
                      >
                        {game.coverImage && <img src={game.coverImage} alt="" style={styles.gameCover} />}
                        <span style={styles.gameItemTitle}>{game.title}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedGame && selectedGame.rawgId !== 0 && (
                <div style={styles.selectedGame}>
                  ✓ Selecionado: <strong>{selectedGame.title}</strong>
                </div>
              )}
            </>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label style={{ color: '#eee', whiteSpace: 'nowrap' }}>Nota (1–10):</label>
              <input
                style={{ ...styles.input, width: '80px' }}
                type="number" min="1" max="10"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              />
              <span style={{ color: '#f39c12', fontSize: '1.4rem' }}>
                {'★'.repeat(Math.round(Number(rating) / 2))}{'☆'.repeat(5 - Math.round(Number(rating) / 2))}
              </span>
            </div>
            <input
              style={styles.input}
              placeholder="Título da avaliação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
              placeholder="Escreva sua avaliação..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            {error && <div style={styles.error}>{error}</div>}
            <button style={styles.btn} type="submit">
              {editingId ? 'Salvar Alterações' : 'Publicar Avaliação'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#aaa' }}>Carregando...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: '#aaa' }}>Nenhuma avaliação ainda. Clique em "+ Nova Avaliação" para começar!</p>
      ) : (
        <div style={styles.list}>
          {reviews.map((review) => (
            <div key={review.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.reviewTitle}>{review.title}</h3>
                  {review.game && <p style={styles.gameName}>{review.game.title}</p>}
                </div>
                <span style={styles.rating}>★ {review.rating}/10</span>
              </div>
              <p style={styles.reviewContent}>{review.content}</p>
              <div style={styles.cardActions}>
                <button style={styles.editBtn} onClick={() => startEdit(review)}>Editar</button>
                <button style={styles.deleteBtn} onClick={() => deleteReview(review.id)}>Excluir</button>
              </div>
            </div>
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
  label: { color: '#aaa', margin: '0 0 8px', fontSize: '0.9rem' },
  btn: { padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  form: { background: '#16213e', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '4px' },
  tab: { padding: '8px 16px', background: '#0f3460', color: '#aaa', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' },
  activeTab: { background: '#e94560', color: '#fff', borderColor: '#e94560' },
  gameList: { maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' },
  gameItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '6px', cursor: 'pointer', background: '#0f3460', border: '2px solid transparent' },
  gameItemSelected: { borderColor: '#e94560' },
  gameCover: { width: '40px', height: '28px', objectFit: 'cover', borderRadius: '3px' },
  gameItemTitle: { color: '#eee', fontSize: '0.9rem' },
  selectedGame: { background: '#2ecc7120', color: '#2ecc71', padding: '8px 12px', borderRadius: '4px', fontSize: '0.9rem' },
  input: { padding: '10px', background: '#0f3460', color: '#eee', border: '1px solid #333', borderRadius: '4px', fontSize: '1rem', width: '100%', boxSizing: 'border-box' },
  error: { background: '#e9456030', color: '#e94560', padding: '10px', borderRadius: '4px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: '#16213e', padding: '16px', borderRadius: '8px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  reviewTitle: { color: '#eee', margin: '0 0 4px' },
  gameName: { color: '#888', margin: 0, fontSize: '0.85rem' },
  rating: { color: '#f39c12', fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap' },
  reviewContent: { color: '#aaa', margin: '0 0 12px' },
  cardActions: { display: 'flex', gap: '8px' },
  editBtn: { padding: '6px 14px', background: '#0f3460', color: '#eee', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { padding: '6px 14px', background: 'transparent', color: '#e94560', border: '1px solid #e94560', borderRadius: '4px', cursor: 'pointer' },
};
