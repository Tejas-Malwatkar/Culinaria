import type { Review } from '../types/recipe';
import { http } from './http';

export function getRecipeReviews(recipeId: string): Promise<Review[]> {
  return http<Review[]>(`/recipes/${recipeId}/reviews`, {
    method: 'GET',
  });
}

export function addReview(
  recipeId: string,
  rating: number,
  comment?: string,
): Promise<Review> {
  return http<Review>(`/recipes/${recipeId}/reviews`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ rating, comment }),
  });
}

export function deleteReview(reviewId: string): Promise<void> {
  return http<void>(`/reviews/${reviewId}`, {
    method: 'DELETE',
    auth: true,
  });
}
