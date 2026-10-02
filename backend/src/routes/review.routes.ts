import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getRecipeReviews,
  addReview,
  deleteReview,
} from '../controllers/review.controller';

const router = Router();

router.get('/recipes/:recipeId/reviews', getRecipeReviews);
router.post('/recipes/:recipeId/reviews', authenticate, addReview);
router.delete('/reviews/:id', authenticate, deleteReview);

export default router;
