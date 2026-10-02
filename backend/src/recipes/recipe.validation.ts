import { z } from 'zod';

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  unit: z.string().optional().default(''),
});

export const instructionSchema = z.object({
  stepNumber: z.number().optional(),
  instructionText: z.string().min(1, 'Instruction step content is required'),
});

export const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().optional().nullable(),
  prepTime: z.number().int().nonnegative().optional().default(15),
  cookTime: z.number().int().nonnegative().optional().default(20),
  servings: z.number().int().positive().optional().default(4),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional().default('EASY'),
  cuisine: z.string().optional().nullable(),
  dietary: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  ingredients: z
    .array(ingredientSchema)
    .min(1, 'At least one ingredient required'),
  instructions: z
    .array(z.union([z.string(), instructionSchema]))
    .optional()
    .default([]),
});

export {};

