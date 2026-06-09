export type Role = 'USER' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  createdAt: string;
  _count?: { userGames: number; reviews: number; posts: number };
}

export interface GameListItem {
  id: number;
  rawgId: number;
  title: string;
  coverImage?: string;
}

export interface GameList {
  id: number;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  user?: { username: string };
  items?: GameListItem[];
  _count?: { items: number };
}

export interface NewsPost {
  id: number;
  title: string;
  summary?: string;
  content: string;
  coverImage?: string;
  published: boolean;
  createdAt: string;
  author?: { username: string };
}

export interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  icon?: string;
  points: number;
  unlocked?: boolean;
  unlockedAt?: string | null;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
  _count?: { quizzes: number; gameLists: number; reviews: number };
}

export interface Game {
  rawgId: number;
  title: string;
  coverImage?: string;
  genre?: string;
  releasedAt?: string;
  metacriticScore?: number;
}

export type GameStatus = 'backlog' | 'playing' | 'completed' | 'dropped';

export interface UserGame {
  id: number;
  status: GameStatus;
  hoursPlayed?: number;
  completionPercentage?: number;
  addedAt: string;
  game: Game & { id: number };
}

export interface Review {
  id: number;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  user: { username: string; avatarUrl?: string };
  game?: Game;
}

export interface ForumPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  user: { username: string; avatarUrl?: string };
  game?: { title: string; coverImage?: string } | null;
  _count?: { comments: number };
  comments?: PostComment[];
}

export interface PostComment {
  id: number;
  content: string;
  createdAt: string;
  user: { username: string; avatarUrl?: string };
}

export interface RankingEntry {
  position: number;
  userId: number;
  username: string;
  avatarUrl?: string;
  completedGames: number;
  avgCompletion: number;
}
