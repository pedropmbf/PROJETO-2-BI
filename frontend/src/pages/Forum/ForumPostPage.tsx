import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { ForumPost } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function ForumPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

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
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao comentar'));
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

  const startEditPost = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditingPost(true);
    setError('');
  };

  const cancelEditPost = () => {
    setEditingPost(false);
    setEditTitle('');
    setEditContent('');
  };

  const saveEditPost = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      setError('Título e conteúdo são obrigatórios');
      return;
    }
    try {
      const { data } = await api.put(`/api/forum/${id}`, { title: editTitle, content: editContent });
      setPost((prev) => prev ? { ...prev, title: data.title, content: data.content } : prev);
      cancelEditPost();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao editar post'));
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

  const startEditComment = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingContent(currentContent);
    setError('');
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const saveEditComment = async (commentId: number) => {
    if (!editingContent.trim()) return;
    try {
      const { data } = await api.put(`/api/forum/comments/${commentId}`, { content: editingContent });
      setPost((prev) => prev ? {
        ...prev,
        comments: prev.comments?.map((c) => c.id === commentId ? { ...c, content: data.content } : c),
      } : prev);
      cancelEditComment();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao editar comentário'));
    }
  };

  if (loading) return <p style={{ color: '#aaa', padding: '24px' }}>Carregando...</p>;
  if (!post) return <p style={{ color: '#e94560', padding: '24px' }}>{error || 'Post não encontrado'}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.post}>
        <div style={styles.postHeader}>
          {editingPost ? (
            <input
              style={styles.editTitleInput}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título"
            />
          ) : (
            <h1 style={styles.title}>{post.title}</h1>
          )}
          {user?.username === post.user.username && !editingPost && (
            <div style={styles.postActions}>
              <button style={styles.editBtn} onClick={startEditPost}>Editar</button>
              <button style={styles.deleteBtn} onClick={deletePost}>Excluir Post</button>
            </div>
          )}
        </div>
        <p style={styles.meta}>por <strong>{post.user.username}</strong> · {new Date(post.createdAt).toLocaleDateString('pt-BR')}</p>
        {post.game && <span style={styles.gameBadge}>{post.game.title}</span>}
        {editingPost ? (
          <div style={styles.editPostForm}>
            <textarea
              style={{ ...styles.textarea, minHeight: '120px' }}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Conteúdo"
            />
            {error && <div style={styles.error}>{error}</div>}
            <div style={styles.editPostActions}>
              <button type="button" style={styles.editBtn} onClick={cancelEditPost}>Cancelar</button>
              <button type="button" style={styles.btn} onClick={saveEditPost}>Salvar alterações</button>
            </div>
          </div>
        ) : (
          <p style={styles.content}>{post.content}</p>
        )}
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
          {post.comments?.map((c) => {
            const isOwn = user?.username === c.user.username;
            const isEditing = editingCommentId === c.id;
            return (
              <div key={c.id} style={styles.comment}>
                <div style={styles.commentHeader}>
                  <strong style={styles.commentAuthor}>{c.user.username}</strong>
                  <span style={styles.commentDate}>{new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
                  {isOwn && !isEditing && (
                    <>
                      <button style={styles.editCommentBtn} onClick={() => startEditComment(c.id, c.content)}>Editar</button>
                      <button style={styles.deleteCommentBtn} onClick={() => deleteComment(c.id)}>×</button>
                    </>
                  )}
                </div>
                {isEditing ? (
                  <div style={styles.editCommentForm}>
                    <textarea
                      style={styles.textarea}
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button type="button" style={styles.editCommentBtn} onClick={cancelEditComment}>Cancelar</button>
                      <button type="button" style={styles.btn} onClick={() => saveEditComment(c.id)}>Salvar</button>
                    </div>
                  </div>
                ) : (
                  <p style={styles.commentContent}>{c.content}</p>
                )}
              </div>
            );
          })}
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
  postActions: { display: 'flex', gap: '8px' },
  editBtn: { padding: '6px 14px', background: 'transparent', color: '#3498db', border: '1px solid #3498db', borderRadius: '4px', cursor: 'pointer' },
  editTitleInput: { flex: 1, padding: '8px 12px', fontSize: '1.4rem', background: '#0f3460', color: '#eee', border: '1px solid #333', borderRadius: '4px', marginRight: '12px' },
  editPostForm: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' },
  editPostActions: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
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
  deleteCommentBtn: { background: 'transparent', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '1.2rem' },
  editCommentBtn: { marginLeft: 'auto', background: 'transparent', border: '1px solid #3498db', color: '#3498db', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.75rem' },
  editCommentForm: { display: 'flex', flexDirection: 'column', gap: '8px' },
  commentContent: { color: '#ccc', margin: 0, fontSize: '0.9rem' },
};
