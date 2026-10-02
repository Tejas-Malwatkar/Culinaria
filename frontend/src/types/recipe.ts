import { User } from './user';

export interface IngredientInput {
  name: string;
  quantity: string;
  unit?: string;
}

export interface Ingredient extends IngredientInput {
  id: string;
}

export interface InstructionInput {
  stepNumber?: number;
  instructionText: string;
}

export interface Instruction extends InstructionInput {
  id: string;
  stepNumber: number;
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type RecipeStatus = 'DRAFT' | 'PUBLISHED';

export interface RecipeCategory {
  id: string;
  name: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  userId: string;
  recipeId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number | null;
  difficulty?: Difficulty;
  cuisine?: string | null;
  dietary?: string | null;
  tags?: string | null;
  status: RecipeStatus;
  authorId: string;
  categoryId: string;
  category: RecipeCategory;
  ingredients: Ingredient[];
  instructions?: Instruction[];
  author?: User;
  likesCount?: number;
  reviewsCount?: number;
  avgRating?: number;
  liked?: boolean;
  reviews?: Review[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRecipePayload {
  title: string;
  description: string;
  categoryId: string;
  imageUrl?: string | null;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: Difficulty;
  cuisine?: string | null;
  dietary?: string | null;
  tags?: string | null;
  ingredients: IngredientInput[];
  instructions?: (string | InstructionInput)[];
}

export interface UpdateRecipePayload extends CreateRecipePayload {}

export interface SearchQueryParams {
  q?: string;
  categoryId?: string;
  cuisine?: string;
  difficulty?: string;
  dietary?: string;
  maxPrepTime?: number;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'rating' | 'cookTime';
}
