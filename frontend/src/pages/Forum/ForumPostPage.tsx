import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { ForumPost } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function ForumPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/forum/${id}`).then(({ data }) => setPost(data)).catch(() => setError('Post não encontrado')).finally(() => setLoading(false));
  }, [id]);

  const submitComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await api.post(`/api/forum/${id}/comments`, { content: comment });
      setPost((prev) => prev ? { ...prev, comments: [...(prev.comments || []), data] } : prev);
      setComment('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao comentar');
    }
  };

  const deletePost = async () => {
    if (!confirm('Excluir post?')) return;
    try {
      await api.delete(`/api/forum/${id}`);
      navigate('/forum');
    } catch {
      setError('Erro ao excluir post');
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await api.delete(`/api/forum/comments/${commentId}`);
      setPost((prev) => prev ? { ...prev, comments: prev.comments?.filter((c) => c.id !== commentId) } : prev);
    } catch {
      setError('Erro ao excluir comentário');
    }
  };

  if (loading) return <p style={{ color: '#aaa', padding: '24px' }}>Carregando...</p>;
  if (!post) return <p style={{ color: '#e94560', padding: '24px' }}>{error || 'Post não encontrado'}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.post}>
        <div style={styles.postHeader}>
          <h1 style={styles.title}>{post.title}</h1>
          {user?.username === post.user.username && (
            <button style={styles.deleteBtn} onClick={deletePost}>Excluir Post</button>
          )}
        </div>
        <p style={styles.meta}>por <strong>{post.user.username}</strong> · {new Date(post.createdAt).toLocaleDateString('pt-BR')}</p>
        {post.game && <span style={styles.gameBadge}>{post.game.title}</span>}
        <p style={styles.content}>{post.content}</p>
      </div>

      <div style={styles.commentsSection}>
        <h2 style={styles.commentsTitle}>Comentários ({post.comments?.length ?? 0})</h2>

        {isAuthenticated && (
          <form onSubmit={submitComment} style={styles.commentForm}>
            <textarea style={styles.textarea} placeholder="Escreva um comentário..." value={comment}
              onChange={(e) => setComment(e.target.value)} required />
            {error && <div style={styles.error}>{error}</div>}
            <button style={styles.btn} type="submit">Comentar</button>
          </form>
        )}

        <div style={styles.commentsList}>
          {post.comments?.map((c) => (
            <div key={c.id} style={styles.comment}>
              <div style={styles.commentHeader}>
                <strong style={styles.commentAuthor}>{c.user.username}</strong>
                <span style={styles.commentDate}>{new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
                {user?.username === c.user.username && (
                  <button style={styles.deleteCommentBtn} onClick={() => deleteComment(c.id)}>×</button>
                )}
              </div>
              <p style={styles.commentContent}>{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '800px', margin: '0 auto' },
  post: { background: '#16213e', padding: '24px', borderRadius: '8px', marginBottom: '24px' },
  postHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { color: '#eee', margin: '0 0 8px' },
  meta: { color: '#888', fontSize: '0.85rem', marginBottom: '12px' },
  gameBadge: { background: '#e94560', color: '#fff', padding: '2px 10px', borderRadius: '4px', fontSize: '0.8rem' },
  content: { color: '#ccc', marginTop: '16px', lineHeight: '1.6' },
  deleteBtn: { padding: '6px 14px', background: 'transparent', color: '#e94560', border: '1px solid #e94560', borderRadius: '4px', cursor: 'pointer' },
  commentsSection: { background: '#16213e', padding: '24px', borderRadius: '8px' },
  commentsTitle: { color: '#e94560', marginTop: 0 },
  commentForm: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  textarea: { padding: '10px', background: '#0f3460', color: '#eee', border: '1px solid #333', borderRadius: '4px', fontSize: '0.95rem', minHeight: '80px', resize: 'vertical' },
  btn: { alignSelf: 'flex-end', padding: '8px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error: { background: '#e9456030', color: '#e94560', padding: '8px', borderRadius: '4px' },
  commentsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  comment: { background: '#0f3460', padding: '12px', borderRadius: '6px' },
  commentHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  commentAuthor: { color: '#3498db' },
  commentDate: { color: '#666', fontSize: '0.8rem' },
  deleteCommentBtn: { marginLeft: 'auto', background: 'transparent', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '1.2rem' },
  commentContent: { color: '#ccc', margin: 0, fontSize: '0.9rem' },
};
