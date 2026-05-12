export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  _count?: { userGames: number; reviews: number; posts: number };
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
