import { prisma } from '../lib/prisma';
import { Prisma, Difficulty } from '@prisma/client';

export interface RecipeInput {
  title: string;
  description: string;
  categoryId: string;
  imageUrl?: string | null;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  cuisine?: string | null;
  dietary?: string | null;
  tags?: string | null;
  ingredients: {
    name: string;
    quantity: string;
    unit?: string | null;
  }[];
  instructions?: (
    | string
    | { stepNumber?: number; instructionText: string }
  )[];
}

const recipeIncludeOptions = {
  category: true,
  ingredients: true,
  instructions: {
    orderBy: { stepNumber: 'asc' as const },
  },
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  },
  reviews: {
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' as const },
  },
  _count: {
    select: { likes: true, reviews: true },
  },
};

export const formatRecipeWithStats = (recipe: any) => {
  if (!recipe) return null;
  const reviews = recipe.reviews || [];
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? Number(
          (
            reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
            totalReviews
          ).toFixed(1),
        )
      : 0;

  return {
    ...recipe,
    avgRating,
    likesCount: recipe._count?.likes ?? 0,
    reviewsCount: recipe._count?.reviews ?? totalReviews,
  };
};

export const createRecipe = async (userId: string, data: RecipeInput) => {
  const instructionsData = (data.instructions || []).map((step, idx) => {
    if (typeof step === 'string') {
      return { stepNumber: idx + 1, instructionText: step };
    }
    return {
      stepNumber: step.stepNumber || idx + 1,
      instructionText: step.instructionText,
    };
  });

  const recipe = await prisma.recipe.create({
    data: {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      imageUrl: data.imageUrl || null,
      prepTime: data.prepTime ?? 15,
      cookTime: data.cookTime ?? 20,
      servings: data.servings ?? 4,
      difficulty: (data.difficulty as Difficulty) || 'EASY',
      cuisine: data.cuisine || null,
      dietary: data.dietary || null,
      tags: data.tags || null,
      authorId: userId,
      status: 'PUBLISHED', // Auto-publish created recipes for seamless user experience
      publishedAt: new Date(),
      ingredients: {
        create: data.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit || '',
        })),
      },
      instructions: {
        create: instructionsData,
      },
    },
    include: recipeIncludeOptions,
  });

  return formatRecipeWithStats(recipe);
};

export const getUserRecipes = async (userId: string) => {
  const recipes = await prisma.recipe.findMany({
    where: { authorId: userId },
    include: recipeIncludeOptions,
    orderBy: { createdAt: 'desc' },
  });

  return recipes.map(formatRecipeWithStats);
};

export const verifyOwnership = async (
  recipeId: string,
  userId: string,
  userRole?: string,
) => {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
  });

  if (!recipe) {
    const error = new Error('Recipe not found') as Error & { status?: number };
    error.status = 404;
    throw error;
  }

  if (recipe.authorId !== userId && userRole !== 'ADMIN') {
    const error = new Error('Forbidden') as Error & { status?: number };
    error.status = 403;
    throw error;
  }

  return recipe;
};

export const updateRecipe = async (
  recipeId: string,
  userId: string,
  data: RecipeInput,
  userRole?: string,
) => {
  await verifyOwnership(recipeId, userId, userRole);

  const instructionsData = (data.instructions || []).map((step, idx) => {
    if (typeof step === 'string') {
      return { stepNumber: idx + 1, instructionText: step };
    }
    return {
      stepNumber: step.stepNumber || idx + 1,
      instructionText: step.instructionText,
    };
  });

  const updated = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      await tx.ingredient.deleteMany({ where: { recipeId } });
      await tx.instruction.deleteMany({ where: { recipeId } });

      return tx.recipe.update({
        where: { id: recipeId },
        data: {
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          imageUrl: data.imageUrl,
          prepTime: data.prepTime,
          cookTime: data.cookTime,
          servings: data.servings,
          difficulty: data.difficulty as Difficulty,
          cuisine: data.cuisine,
          dietary: data.dietary,
          tags: data.tags,
          ingredients: {
            create: data.ingredients.map((ingredient) => ({
              name: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit || '',
            })),
          },
          instructions: {
            create: instructionsData,
          },
        },
        include: recipeIncludeOptions,
      });
    },
  );

  return formatRecipeWithStats(updated);
};

export const deleteRecipe = async (
  recipeId: string,
  userId: string,
  userRole?: string,
) => {
  await verifyOwnership(recipeId, userId, userRole);

  await prisma.$transaction([
    prisma.review.deleteMany({ where: { recipeId } }),
    prisma.like.deleteMany({ where: { recipeId } }),
    prisma.ingredient.deleteMany({ where: { recipeId } }),
    prisma.instruction.deleteMany({ where: { recipeId } }),
    prisma.recipe.delete({ where: { id: recipeId } }),
  ]);
};

export const getPublishedRecipes = async () => {
  const recipes = await prisma.recipe.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { not: null },
    },
    include: recipeIncludeOptions,
    orderBy: { publishedAt: 'desc' },
  });

  return recipes.map(formatRecipeWithStats);
};

export const getPublishedRecipeById = async (id: string) => {
  const recipe = await prisma.recipe.findFirst({
    where: {
      id,
      status: 'PUBLISHED',
    },
    include: recipeIncludeOptions,
  });

  return formatRecipeWithStats(recipe);
};

export const getRelatedRecipes = async (recipeId: string) => {
  const currentRecipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { categoryId: true, cuisine: true },
  });

  if (!currentRecipe) return [];

  const recipes = await prisma.recipe.findMany({
    where: {
      id: { not: recipeId },
      status: 'PUBLISHED',
      OR: [
        { categoryId: currentRecipe.categoryId },
        { cuisine: currentRecipe.cuisine ? currentRecipe.cuisine : undefined },
      ],
    },
    include: recipeIncludeOptions,
    take: 4,
  });

  return recipes.map(formatRecipeWithStats);
};

export const getPopularRecipes = async () => {
  const recipes = await prisma.recipe.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: recipeIncludeOptions,
    orderBy: {
      likes: { _count: 'desc' },
    },
    take: 8,
  });

  return recipes.map(formatRecipeWithStats);
};

export const getRecentRecipes = async () => {
  const recipes = await prisma.recipe.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: recipeIncludeOptions,
    orderBy: {
      createdAt: 'desc',
    },
    take: 8,
  });

  return recipes.map(formatRecipeWithStats);
};

export interface SearchFilterOptions {
  query?: string;
  categoryId?: string;
  cuisine?: string;
  difficulty?: string;
  dietary?: string;
  maxPrepTime?: number;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'rating' | 'cookTime';
}

export const searchRecipes = async (options: SearchFilterOptions) => {
  const { query, categoryId, cuisine, difficulty, dietary, maxPrepTime, sortBy } =
    options;

  const whereClause: Prisma.RecipeWhereInput = {
    status: 'PUBLISHED',
  };

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (cuisine) {
    whereClause.cuisine = cuisine;
  }

  if (difficulty && ['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
    whereClause.difficulty = difficulty as Difficulty;
  }

  if (maxPrepTime) {
    whereClause.prepTime = { lte: maxPrepTime };
  }

  const conditions: Prisma.RecipeWhereInput[] = [];

  if (query && query.trim()) {
    const q = query.trim();
    conditions.push({
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { ingredients: { some: { name: { contains: q } } } },
        { tags: { contains: q } },
      ],
    });
  }

  if (dietary && dietary.trim()) {
    conditions.push({
      dietary: { contains: dietary.trim() },
    });
  }

  if (conditions.length > 0) {
    whereClause.AND = conditions;
  }

  let orderBy: Prisma.RecipeOrderByWithRelationInput = { createdAt: 'desc' };

  if (sortBy === 'oldest') {
    orderBy = { createdAt: 'asc' };
  } else if (sortBy === 'popular') {
    orderBy = { likes: { _count: 'desc' } };
  } else if (sortBy === 'cookTime') {
    orderBy = { cookTime: 'asc' };
  }

  const recipes = await prisma.recipe.findMany({
    where: whereClause,
    include: recipeIncludeOptions,
    orderBy,
  });

  const formatted = recipes.map(formatRecipeWithStats);

  if (sortBy === 'rating') {
    formatted.sort((a, b) => b.avgRating - a.avgRating);
  }

  return formatted;
};

export const getRecipeByIdForUser = async (
  recipeId: string,
  userId: string,
) => {
  const recipe = await prisma.recipe.findFirst({
    where: {
      id: recipeId,
      authorId: userId,
    },
    include: recipeIncludeOptions,
  });

  return formatRecipeWithStats(recipe);
};

export const updateRecipeStatus = async (
  recipeId: string,
  userId: string,
  status: 'DRAFT' | 'PUBLISHED',
  userRole?: string,
) => {
  await verifyOwnership(recipeId, userId, userRole);

  const updated = await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      status,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
    include: recipeIncludeOptions,
  });

  return formatRecipeWithStats(updated);
};

