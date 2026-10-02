import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as reviewService from '../services/review.service';

export const getRecipeReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipeId = req.params.recipeId as string;
    const reviews = await reviewService.getRecipeReviews(recipeId);
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

export const addReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId!;
    const recipeId = req.params.recipeId as string;
    const { rating, comment } = req.body;

    if (!rating || typeof rating !== 'number') {
      return res.status(400).json({ message: 'Numeric rating (1-5) is required' });
    }

    const review = await reviewService.addReview(
      userId,
      recipeId,
      rating,
      comment,
    );

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId!;
    const userRole = req.userRole;
    const id = req.params.id as string;

    await reviewService.deleteReview(id, userId, userRole);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

