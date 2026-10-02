import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as recipeService from './recipe.service';
import { recipeSchema } from './recipe.validation';
import { Request } from 'express';
import { prisma } from '../lib/prisma';

export const createRecipe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId!;
    const validatedData = recipeSchema.parse(req.body);

    const recipe = await recipeService.createRecipe(userId, validatedData);

    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
};

export const getMyRecipes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId!;
    const recipes = await recipeService.getUserRecipes(userId);

    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

export const updateRecipe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipeId = req.params.id as string;
    const userId = req.userId!;
    const userRole = req.userRole;

    const validatedData = recipeSchema.parse(req.body);

    const updated = await recipeService.updateRecipe(
      recipeId,
      userId,
      validatedData,
      userRole,
    );

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteRecipe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipeId = req.params.id as string;
    const userId = req.userId!;
    const userRole = req.userRole;

    await recipeService.deleteRecipe(recipeId, userId, userRole);

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPublishedRecipes = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipes = await recipeService.getPublishedRecipes();
    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

export const getRecipeById = async (
  req: AuthRequest & { params: { id: string } },
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const recipe = await recipeService.getPublishedRecipeById(id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    let liked = false;

    if (userId) {
      const existing = await prisma.like.findUnique({
        where: {
          userId_recipeId: {
            userId,
            recipeId: id,
          },
        },
      });

      liked = !!existing;
    }

    res.json({
      ...recipe,
      liked,
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatedRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipeId = req.params.id as string;
    const related = await recipeService.getRelatedRecipes(recipeId);
    res.json(related);
  } catch (error) {
    next(error);
  }
};

export const getPopularRecipes = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipes = await recipeService.getPopularRecipes();
    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

export const getRecentRecipes = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipes = await recipeService.getRecentRecipes();
    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

export const searchRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      q,
      categoryId,
      cuisine,
      difficulty,
      dietary,
      maxPrepTime,
      sortBy,
    } = req.query;

    const recipes = await recipeService.searchRecipes({
      query: q as string,
      categoryId: categoryId as string,
      cuisine: cuisine as string,
      difficulty: difficulty as string,
      dietary: dietary as string,
      maxPrepTime: maxPrepTime ? Number(maxPrepTime) : undefined,
      sortBy: sortBy as any,
    });

    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

export const getRecipeForEdit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipeId = req.params.id as string;
    const userId = req.userId!;

    const recipe = await recipeService.getRecipeByIdForUser(recipeId, userId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

export const updateRecipeStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipeId = req.params.id as string;
    const userId = req.userId!;
    const userRole = req.userRole;
    const { status } = req.body;

    if (!['DRAFT', 'PUBLISHED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updated = await recipeService.updateRecipeStatus(
      recipeId,
      userId,
      status,
      userRole,
    );

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

