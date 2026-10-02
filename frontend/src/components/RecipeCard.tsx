import { Link } from 'react-router-dom';
import type { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onLikeToggle?: (recipeId: string, currentLiked: boolean) => void;
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const imageUrl = recipe.imageUrl || DEFAULT_IMAGE;
  const rating = recipe.avgRating && recipe.avgRating > 0 ? recipe.avgRating : null;
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="group relative bg-white border border-amber-100/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Recipe Image & Badges */}
      <Link to={`/recipes/${recipe.id}`} className="relative aspect-4/3 w-full overflow-hidden bg-amber-50 block">
        <img
          src={imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Category & Difficulty Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {recipe.category && (
            <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/90 text-white backdrop-blur-xs rounded-full shadow-xs">
              {recipe.category.name}
            </span>
          )}
          {recipe.difficulty && (
            <span
              className={`px-2.5 py-1 text-xs font-semibold backdrop-blur-xs rounded-full text-white shadow-xs ${
                recipe.difficulty === 'EASY'
                  ? 'bg-emerald-600/90'
                  : recipe.difficulty === 'MEDIUM'
                    ? 'bg-amber-600/90'
                    : 'bg-rose-600/90'
              }`}
            >
              {recipe.difficulty}
            </span>
          )}
        </div>

        {/* Rating score badge */}
        {rating && (
          <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-xs text-amber-400 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs">
            <span>★</span>
            <span className="text-white">{rating}</span>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <Link to={`/recipes/${recipe.id}`}>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition line-clamp-1 mb-1.5">
              {recipe.title}
            </h3>
          </Link>

          {/* Description preview */}
          <div
            className="text-slate-600 text-xs line-clamp-2 mb-3 prose prose-xs"
            dangerouslySetInnerHTML={{
              __html: recipe.description
                ? recipe.description.replace(/<[^>]*>?/gm, '')
                : 'No description provided.',
            }}
          />
        </div>

        {/* Footer info: Cook time, Cuisine, Author */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            {totalTime > 0 && (
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {totalTime} mins
              </span>
            )}
            {recipe.cuisine && (
              <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                {recipe.cuisine}
              </span>
            )}
          </div>

          <Link
            to={`/recipes/${recipe.id}`}
            className="font-semibold text-amber-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5"
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
