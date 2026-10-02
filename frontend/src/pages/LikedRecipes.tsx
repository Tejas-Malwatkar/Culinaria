import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLikedRecipes } from '../api/like.api';
import RecipeCard from '../components/RecipeCard';
import type { Recipe } from '../types/recipe';

export default function LikedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        setLoading(true);
        const data = await getLikedRecipes();
        setRecipes(data);
      } catch {
        console.error('Failed to fetch liked recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, []);

  return (
    <div className="min-h-screen bg-amber-50/30 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">❤️ Saved Favorites</h1>
          <p className="text-xs text-slate-500 mt-1">
            Your personal collection of bookmarked culinary recipes
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="bg-white border border-amber-100 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="text-4xl">❤️</div>
            <h2 className="text-xl font-bold text-slate-900">No saved recipes yet</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore our culinary catalog and tap the heart icon to save recipes to your collection.
            </p>
            <Link
              to="/search"
              className="inline-block px-6 py-3 rounded-xl text-white font-bold text-xs bg-amber-600 hover:bg-amber-700 transition shadow-xs"
            >
              Explore Recipes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
