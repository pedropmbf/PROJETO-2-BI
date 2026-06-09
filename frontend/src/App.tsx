import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ExplorePage from './pages/Explore/ExplorePage';
import LibraryPage from './pages/Library/LibraryPage';
import ReviewsPage from './pages/Reviews/ReviewsPage';
import ForumPage from './pages/Forum/ForumPage';
import ForumPostPage from './pages/Forum/ForumPostPage';
import RankingPage from './pages/Ranking/RankingPage';
import ProfilePage from './pages/Profile/ProfilePage';
import QuizListPage from './pages/Quiz/QuizListPage';
import QuizPlayPage from './pages/Quiz/QuizPlayPage';
import QuizResultPage from './pages/Quiz/QuizResultPage';
import QuizRankingPage from './pages/Quiz/QuizRankingPage';
import CreateQuizPage from './pages/Quiz/CreateQuizPage';
import ListsPage from './pages/Lists/ListsPage';
import ListDetailPage from './pages/Lists/ListDetailPage';
import CreateListPage from './pages/Lists/CreateListPage';
import NewsPage from './pages/News/NewsPage';
import NewsDetailPage from './pages/News/NewsDetailPage';
import AchievementsPage from './pages/Achievements/AchievementsPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminNewsPage from './pages/Admin/AdminNewsPage';
import AdminAchievementsPage from './pages/Admin/AdminAchievementsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/explore" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/:id" element={<ForumPostPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/library" element={<PrivateRoute><LibraryPage /></PrivateRoute>} />
        <Route path="/reviews" element={<PrivateRoute><ReviewsPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/quiz" element={<QuizListPage />} />
        <Route path="/quiz/criar" element={<PrivateRoute><CreateQuizPage /></PrivateRoute>} />
        <Route path="/quiz/:id/editar" element={<PrivateRoute><CreateQuizPage mode="edit" /></PrivateRoute>} />
        <Route path="/quiz/:id/play" element={<QuizPlayPage />} />
        <Route path="/quiz/:id/resultado" element={<QuizResultPage />} />
        <Route path="/quiz/:id/ranking" element={<QuizRankingPage />} />

        <Route path="/listas" element={<ListsPage />} />
        <Route path="/listas/criar" element={<PrivateRoute><CreateListPage /></PrivateRoute>} />
        <Route path="/listas/:id/editar" element={<PrivateRoute><CreateListPage mode="edit" /></PrivateRoute>} />
        <Route path="/listas/:id" element={<ListDetailPage />} />

        <Route path="/noticias" element={<NewsPage />} />
        <Route path="/noticias/:id" element={<NewsDetailPage />} />

        <Route path="/conquistas" element={<AchievementsPage />} />

        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/usuarios" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/admin/noticias" element={<AdminRoute><AdminNewsPage /></AdminRoute>} />
        <Route path="/admin/conquistas" element={<AdminRoute><AdminAchievementsPage /></AdminRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: '#0f0f1a', color: '#eee', fontFamily: 'system-ui, sans-serif' }}>
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
