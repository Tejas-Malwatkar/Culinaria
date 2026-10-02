export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'USER' | 'ADMIN';
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt?: string;
  _count?: {
    recipes?: number;
    reviews?: number;
    likes?: number;
  };
}
