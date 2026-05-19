import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import gamesRoutes from './routes/games.routes';
import libraryRoutes from './routes/library.routes';
import reviewsRoutes from './routes/reviews.routes';
import forumRoutes from './routes/forum.routes';
import rankingRoutes from './routes/ranking.routes';
import usersRoutes from './routes/users.routes';
import quizRoutes from './routes/quiz.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/quizzes', quizRoutes);

export default app;
