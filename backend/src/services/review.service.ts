import { prisma } from '../lib/prisma';

export const getRecipeReviews = async (recipeId: string) => {
  return prisma.review.findMany({
    where: { recipeId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const addReview = async (
  userId: string,
  recipeId: string,
  rating: number,
  comment?: string,
) => {
  if (rating < 1 || rating > 5) {
    const error = new Error('Rating must be between 1 and 5') as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
  });

  if (!recipe) {
    const error = new Error('Recipe not found') as Error & { status?: number };
    error.status = 404;
    throw error;
  }

  return prisma.review.upsert({
    where: {
      userId_recipeId: {
        userId,
        recipeId,
      },
    },
    update: {
      rating,
      comment: comment || null,
    },
    create: {
      userId,
      recipeId,
      rating,
      comment: comment || null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
};

export const deleteReview = async (
  reviewId: string,
  userId: string,
  userRole?: string,
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    const error = new Error('Review not found') as Error & { status?: number };
    error.status = 404;
    throw error;
  }

  if (review.userId !== userId && userRole !== 'ADMIN') {
    const error = new Error('Forbidden') as Error & { status?: number };
    error.status = 403;
    throw error;
  }

  return prisma.review.delete({
    where: { id: reviewId },
  });
};
