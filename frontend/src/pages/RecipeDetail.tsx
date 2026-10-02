import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRecipeById, getRelatedRecipes, deleteRecipe } from '../api/recipe.api';
import { getRecipeReviews, addReview, deleteReview } from '../api/review.api';
import { likeRecipe, unlikeRecipe } from '../api/like.api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RecipeCard from '../components/RecipeCard';
import ConfirmModal from '../components/ConfirmModal';
import type { Recipe, Review } from '../types/recipe';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [related, setRelated] = useState<Recipe[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);

  // Review form state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState(false);

  // Ingredient checklist state
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    const fetchDetailData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [recipeData, relatedData, reviewsData] = await Promise.all([
          getRecipeById(id),
          getRelatedRecipes(id).catch(() => []),
          getRecipeReviews(id).catch(() => []),
        ]);

        if (!isMounted) return;

        setRecipe(recipeData);
        setRelated(relatedData);
        setReviews(reviewsData);
        setLikesCount(recipeData.likesCount || 0);
        setLiked(!!recipeData.liked);
      } catch {
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetailData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const toggleLike = async () => {
    if (!user) {
      addToast('Please log in to save favorites', 'error');
      navigate('/login');
      return;
    }

    if (!recipe) return;

    try {
      if (liked) {
        await unlikeRecipe(recipe.id);
        setLikesCount((c) => Math.max(0, c - 1));
        setLiked(false);
        addToast('Removed from favorites', 'info');
      } else {
        await likeRecipe(recipe.id);
        setLikesCount((c) => c + 1);
        setLiked(true);
        addToast('Added to favorites!', 'success');
      }
    } catch {
      addToast('Failed to update favorites', 'error');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in to leave a review', 'error');
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      setSubmittingReview(true);
      const newReview = await addReview(id, ratingInput, commentInput);
      setReviews((prev) => [
        newReview,
        ...prev.filter((r) => r.userId !== user.id),
      ]);
      setCommentInput('');
      addToast('Review submitted successfully!', 'success');
      
      // Refresh recipe stats
      const updatedRecipe = await getRecipeById(id);
      setRecipe(updatedRecipe);
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      addToast('Review removed', 'info');

      if (id) {
        const updatedRecipe = await getRecipeById(id);
        setRecipe(updatedRecipe);
      }
    } catch {
      addToast('Failed to delete review', 'error');
    }
  };

  const handleDeleteRecipeConfirm = async () => {
    if (!recipe) return;
    try {
      setDeletingRecipe(true);
      await deleteRecipe(recipe.id);
      addToast('Recipe deleted successfully', 'success');
      navigate('/dashboard');
    } catch {
      addToast('Failed to delete recipe', 'error');
    } finally {
      setDeletingRecipe(false);
      setShowDeleteModal(false);
    }
  };

  const toggleIngredientCheck = (ingId: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [ingId]: !prev[ingId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50/30 py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="h-80 bg-slate-200 rounded-3xl" />
          <div className="h-10 bg-slate-200 rounded-xl w-3/4" />
          <div className="h-32 bg-white rounded-2xl border" />
        </div>
      </div>
    );
  }

  if (notFound || !recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50/30 px-4 text-center">
        <div className="w-20 h-20 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-4xl mb-4">
          🍳
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Recipe Not Found</h1>
        <p className="text-slate-600 text-sm max-w-md mb-6">
          The recipe you're looking for does not exist or may have been deleted.
        </p>
        <Link
          to="/search"
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition"
        >
          Explore All Recipes
        </Link>
      </div>
    );
  }

  const isAuthor = user && user.id === recipe.authorId;
  const isAdmin = user && user.role === 'ADMIN';
  const totalCookingTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="min-h-screen bg-amber-50/30 pb-20">
      {/* HERO COVER & BACK BUTTON */}
      <div className="relative h-80 sm:h-96 w-full bg-slate-900 overflow-hidden">
        <img
          src={recipe.imageUrl || DEFAULT_IMAGE}
          alt={recipe.title}
          className="w-full h-full object-cover opacity-85"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            to="/search"
            className="px-4 py-2 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold rounded-xl hover:bg-slate-900 transition flex items-center gap-1.5 shadow-lg border border-white/10"
          >
            ← Back to Recipes
          </Link>
        </div>

        {/* Action buttons (Edit/Delete) */}
        {(isAuthor || isAdmin) && (
          <div className="absolute top-6 right-4 sm:right-8 z-10 flex items-center gap-2">
            <Link
              to={`/recipes/${recipe.id}/edit`}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition"
            >
              ✎ Edit Recipe
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg transition"
            >
              🗑 Delete
            </button>
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 max-w-5xl mx-auto z-10 text-white space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {recipe.category && (
              <span className="px-3 py-1 bg-amber-500 text-white rounded-full">
                {recipe.category.name}
              </span>
            )}
            {recipe.difficulty && (
              <span className="px-3 py-1 bg-slate-800/80 text-amber-300 rounded-full border border-amber-500/30">
                {recipe.difficulty}
              </span>
            )}
            {recipe.cuisine && (
              <span className="px-3 py-1 bg-slate-800/80 text-white rounded-full">
                🌍 {recipe.cuisine}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{recipe.title}</h1>
        </div>
      </div>

      {/* CONTENT CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-10">
        {/* METRICS & QUICK ACTIONS BAR */}
        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-md grid grid-cols-2 sm:grid-cols-5 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="p-2">
            <span className="block text-xs text-slate-400 font-medium">Prep Time</span>
            <span className="text-base sm:text-lg font-bold text-slate-800">
              ⏱ {recipe.prepTime || 15} mins
            </span>
          </div>

          <div className="p-2">
            <span className="block text-xs text-slate-400 font-medium">Cook Time</span>
            <span className="text-base sm:text-lg font-bold text-slate-800">
              🔥 {recipe.cookTime || 20} mins
            </span>
          </div>

          <div className="p-2">
            <span className="block text-xs text-slate-400 font-medium">Total Time</span>
            <span className="text-base sm:text-lg font-bold text-amber-600">
              ⌛ {totalCookingTime} mins
            </span>
          </div>

          <div className="p-2">
            <span className="block text-xs text-slate-400 font-medium">Servings</span>
            <span className="text-base sm:text-lg font-bold text-slate-800">
              🍽 {recipe.servings || 4} Portions
            </span>
          </div>

          <div className="p-2 flex flex-col items-center justify-center col-span-2 sm:col-span-1">
            <button
              onClick={toggleLike}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
                liked
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span>{liked ? '❤️ Saved' : '🤍 Save Favorite'}</span>
              <span className="bg-white/80 px-2 py-0.5 rounded-full text-[11px]">
                {likesCount}
              </span>
            </button>
          </div>
        </div>

        {/* DESCRIPTION & AUTHOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white border border-amber-100 p-6 sm:p-8 rounded-2xl shadow-xs">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About this Recipe</h2>
              <div
                className="prose prose-amber max-w-none text-slate-700 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: recipe.description }}
              />
              {recipe.tags && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {recipe.tags.split(',').map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-medium rounded-lg"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* INGREDIENTS CHECKLIST */}
            <section className="bg-white border border-amber-100 p-6 sm:p-8 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Ingredients Checklist</h2>
                  <p className="text-xs text-slate-500">Tap items to mark as gathered</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                  {recipe.ingredients.length} Items
                </span>
              </div>

              <div className="space-y-2.5">
                {recipe.ingredients.map((ing) => {
                  const isChecked = !!checkedIngredients[ing.id];
                  return (
                    <div
                      key={ing.id}
                      onClick={() => toggleIngredientCheck(ing.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition select-none ${
                        isChecked
                          ? 'bg-slate-50 border-slate-200 opacity-60 line-through text-slate-400'
                          : 'bg-amber-50/40 border-amber-100 text-slate-800 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <span className="font-semibold text-sm">{ing.name}</span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600">
                        {ing.quantity} {ing.unit || ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* STEP-BY-STEP INSTRUCTIONS */}
            <section className="bg-white border border-amber-100 p-6 sm:p-8 rounded-2xl shadow-xs">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Step-by-Step Cooking Instructions</h2>

              {recipe.instructions && recipe.instructions.length > 0 ? (
                <div className="space-y-6">
                  {recipe.instructions.map((step, index) => (
                    <div key={step.id || index} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {step.stepNumber || index + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="font-bold text-slate-900 text-sm mb-1">
                          Step {step.stepNumber || index + 1}
                        </h4>
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {step.instructionText}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500 text-sm">
                  No step-by-step instructions provided for this recipe.
                </div>
              )}
            </section>
          </div>

          {/* SIDEBAR: AUTHOR & RATINGS */}
          <div className="space-y-8">
            {/* Author Profile */}
            {recipe.author && (
              <div className="bg-white border border-amber-100 p-6 rounded-2xl shadow-xs text-center space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Recipe Creator
                </h3>
                {recipe.author.avatarUrl ? (
                  <img
                    src={recipe.author.avatarUrl}
                    alt={recipe.author.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-amber-300 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-800 text-2xl font-bold flex items-center justify-center mx-auto border-2 border-amber-300">
                    {recipe.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{recipe.author.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 italic">
                    {recipe.author.bio || 'Culinary enthusiast & recipe creator'}
                  </p>
                </div>
              </div>
            )}

            {/* Ratings Summary */}
            <div className="bg-white border border-amber-100 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Community Rating</h3>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-black text-amber-500">
                  {recipe.avgRating ? recipe.avgRating : 'N/A'}
                </div>
                <div>
                  <div className="text-amber-400 text-lg">★★★★★</div>
                  <div className="text-xs text-slate-500 font-medium">
                    {recipe.reviewsCount || reviews.length} Total Reviews
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS & COMMENTS SECTION */}
        <section className="bg-white border border-amber-100 p-6 sm:p-8 rounded-2xl shadow-xs space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Ratings & Reviews</h2>
              <p className="text-xs text-slate-500">Read what home cooks think about this recipe</p>
            </div>
          </div>

          {/* Review Submission Form */}
          {user ? (
            <form onSubmit={handleReviewSubmit} className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Write Your Review</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className={`text-2xl transition ${
                        star <= ratingInput ? 'text-amber-500 scale-110' : 'text-slate-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-600">
                    {ratingInput} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Share your experience cooking this recipe (taste, tweaks, tips)..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-600">
              Please <Link to="/login" className="font-bold text-amber-600 hover:underline">Log In</Link> to rate and write a review.
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {rev.user?.avatarUrl ? (
                        <img
                          src={rev.user.avatarUrl}
                          alt={rev.user.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 font-bold text-xs flex items-center justify-center">
                          {rev.user?.name ? rev.user.name.charAt(0) : 'U'}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-900 text-xs">{rev.user?.name || 'Anonymous User'}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-amber-400 text-xs font-bold">
                        {'★'.repeat(rev.rating)}
                        <span className="text-slate-300">{'★'.repeat(5 - rev.rating)}</span>
                      </div>
                      {(user?.id === rev.userId || isAdmin) && (
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {rev.comment && (
                    <p className="text-xs text-slate-700 leading-relaxed pl-9">{rev.comment}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">No reviews yet. Be the first to leave a review!</p>
            )}
          </div>
        </section>

        {/* RELATED RECIPES RECOMMENDATIONS */}
        {related.length > 0 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">You Might Also Like</h2>
              <p className="text-xs text-slate-500">More delicious recipes in this cuisine & category</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((relRecipe) => (
                <RecipeCard key={relRecipe.id} recipe={relRecipe} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Confirmation modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText={deletingRecipe ? 'Deleting...' : 'Delete Recipe'}
        isDangerous
        onConfirm={handleDeleteRecipeConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
