import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ExplorePage from './pages/Explore/ExplorePage';
import LibraryPage from './pages/Library/LibraryPage';
import ReviewsPage from './pages/Reviews/ReviewsPage';
import ForumPage from './pages/Forum/ForumPage';
import ForumPostPage from './pages/Forum/ForumPostPage';
import RankingPage from './pages/Ranking/RankingPage';
import ProfilePage from './pages/Profile/ProfilePage';

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
