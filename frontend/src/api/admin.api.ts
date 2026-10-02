import type { Recipe } from '../types/recipe';
import type { User } from '../types/user';
import { http } from './http';

export interface AdminStats {
  totalUsers: number;
  totalRecipes: number;
  totalCategories: number;
  totalReviews: number;
  totalLikes: number;
  recentUsers: User[];
  recentRecipes: Recipe[];
}

export function getAdminStats(): Promise<AdminStats> {
  return http<AdminStats>('/admin/stats', {
    method: 'GET',
    auth: true,
  });
}

export function getAdminUsers(): Promise<User[]> {
  return http<User[]>('/admin/users', {
    method: 'GET',
    auth: true,
  });
}

export function updateUserRole(
  userId: string,
  role: 'USER' | 'ADMIN',
): Promise<User> {
  return http<User>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ role }),
  });
}

export function deleteAdminUser(userId: string): Promise<void> {
  return http<void>(`/admin/users/${userId}`, {
    method: 'DELETE',
    auth: true,
  });
}

export function getAdminRecipes(): Promise<Recipe[]> {
  return http<Recipe[]>('/admin/recipes', {
    method: 'GET',
    auth: true,
  });
}

export function createCategory(name: string): Promise<{ id: string; name: string }> {
  return http<{ id: string; name: string }>('/admin/categories', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ name }),
  });
}

export function deleteCategory(id: string): Promise<void> {
  return http<void>(`/admin/categories/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}
