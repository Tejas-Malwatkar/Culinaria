import type {
  CreateRecipePayload,
  RecipeStatus,
  Recipe,
  UpdateRecipePayload,
  SearchQueryParams,
} from '../types/recipe';
import { http } from './http';

/**
 * Create new recipe
 */
export function createRecipe(payload: CreateRecipePayload): Promise<Recipe> {
  return http<Recipe>('/recipes', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
}

/**
 * Get current user's recipes
 */
export function getMyRecipes(): Promise<Recipe[]> {
  return http<Recipe[]>('/recipes/my-recipes', {
    method: 'GET',
    auth: true,
  });
}

/**
 * Get single recipe by ID (with optional auth token if logged in)
 */
export function getRecipeById(id: string): Promise<Recipe> {
  const token = localStorage.getItem('token');
  return http<Recipe>(`/recipes/${id}`, {
    method: 'GET',
    auth: !!token,
  });
}

/**
 * Update recipe
 */
export function updateRecipe(
  id: string,
  payload: UpdateRecipePayload,
): Promise<Recipe> {
  return http<Recipe>(`/recipes/${id}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(payload),
  });
}

/**
 * Delete recipe
 */
export function deleteRecipe(id: string): Promise<void> {
  return http<void>(`/recipes/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

/**
 * Change recipe status (Draft / Publish)
 */
export function updateRecipeStatus(
  id: string,
  status: RecipeStatus,
): Promise<Recipe> {
  return http<Recipe>(`/recipes/${id}/status`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ status }),
  });
}

export function getRecipeForEdit(id: string): Promise<Recipe> {
  return http<Recipe>(`/recipes/${id}/edit`, {
    method: 'GET',
    auth: true,
  });
}

export function searchRecipes(params: SearchQueryParams = {}): Promise<Recipe[]> {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.append('q', params.q);
  if (params.categoryId) searchParams.append('categoryId', params.categoryId);
  if (params.cuisine) searchParams.append('cuisine', params.cuisine);
  if (params.difficulty) searchParams.append('difficulty', params.difficulty);
  if (params.dietary) searchParams.append('dietary', params.dietary);
  if (params.maxPrepTime) searchParams.append('maxPrepTime', String(params.maxPrepTime));
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);

  const queryString = searchParams.toString();
  return http<Recipe[]>(`/recipes/search${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
  });
}

export function getRelatedRecipes(id: string): Promise<Recipe[]> {
  return http<Recipe[]>(`/recipes/${id}/related`, {
    method: 'GET',
  });
}

export function getPopularRecipes(): Promise<Recipe[]> {
  return http<Recipe[]>('/recipes/popular', {
    method: 'GET',
  });
}

export function getRecentRecipes(): Promise<Recipe[]> {
  return http<Recipe[]>('/recipes/recent', {
    method: 'GET',
  });
}
