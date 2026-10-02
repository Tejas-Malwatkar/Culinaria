import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getMyRecipes,
  deleteRecipe,
  updateRecipeStatus,
} from '../api/recipe.api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import type { Recipe, RecipeStatus } from '../types/recipe';

export default function Dashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await getMyRecipes();
      setRecipes(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load your recipes.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      await deleteRecipe(deletingId);
      setRecipes((prev) => prev.filter((r) => r.id !== deletingId));
      addToast('Recipe deleted successfully', 'success');
    } catch {
      addToast('Failed to delete recipe.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: RecipeStatus,
  ) => {
    const newStatus = currentStatus === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';

    try {
      await updateRecipeStatus(id, newStatus);

      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
      );

      addToast(
        `Recipe status updated to ${newStatus === 'PUBLISHED' ? 'Published' : 'Draft'}`,
        'success',
      );
    } catch {
      addToast('Failed to update recipe status.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-amber-100 p-6 rounded-3xl shadow-xs">
          <div>
            <h1 className="text-3xl font-black text-slate-900">My Recipes Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your published recipes and draft creations
            </p>
          </div>

          <button
            onClick={() => navigate('/recipes/new')}
            className="px-6 py-3 rounded-xl text-white font-bold text-xs bg-amber-600 hover:bg-amber-700 transition shadow-xs flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Create New Recipe</span>
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-amber-100 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="text-4xl">🍳</div>
            <h2 className="text-xl font-bold text-slate-900">
              No recipes created yet
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start sharing your culinary creations with ingredients and step-by-step instructions.
            </p>
            <button
              onClick={() => navigate('/recipes/new')}
              className="px-6 py-3 rounded-xl text-white font-bold text-xs bg-amber-600 hover:bg-amber-700 transition shadow-xs"
            >
              Create Your First Recipe
            </button>
          </div>
        ) : (
          /* Recipe List */
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white border border-amber-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-300 transition"
              >
                {/* Left */}
                <div className="space-y-1.5">
                  <Link
                    to={`/recipes/${recipe.id}`}
                    className="text-base font-bold text-slate-900 hover:text-amber-600 transition"
                  >
                    {recipe.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        recipe.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {recipe.status}
                    </span>

                    {recipe.category && (
                      <span className="font-semibold text-slate-700">
                        {recipe.category.name}
                      </span>
                    )}

                    <span>•</span>

                    <span>❤️ {recipe.likesCount || 0} Likes</span>

                    <span>•</span>

                    <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    to={`/recipes/${recipe.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    View
                  </Link>

                  <Link
                    to={`/recipes/${recipe.id}/edit`}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleToggleStatus(recipe.id, recipe.status)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    {recipe.status === 'DRAFT' ? 'Publish' : 'Unpublish'}
                  </button>

                  <button
                    onClick={() => setDeletingId(recipe.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? It will be permanently removed."
        confirmText="Delete Recipe"
        isDangerous
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
