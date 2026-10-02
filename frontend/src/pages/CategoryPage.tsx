import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRecipesByCategory } from '../api/public';
import RecipeCard from '../components/RecipeCard';
import type { Recipe } from '../types/recipe';

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const data = await getRecipesByCategory(id);
        if (isMounted) {
          setRecipes(data);
        }
      } catch (err) {
        console.error('Failed to fetch category recipes:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecipes();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50/30 py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Category Recipes</h1>
            <p className="text-xs text-slate-500 mt-1">
              Showing {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} in this category
            </p>
          </div>
          <Link
            to="/search"
            className="text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            ← Explore All Recipes
          </Link>
        </div>

        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-amber-100 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="text-4xl">🍲</div>
            <h2 className="text-xl font-bold text-slate-900">No recipes in this category</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first to publish a recipe in this category!
            </p>
            <Link
              to="/recipes/new"
              className="inline-block px-6 py-3 rounded-xl text-white font-bold text-xs bg-amber-600 hover:bg-amber-700 transition shadow-xs"
            >
              + Create Recipe
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
