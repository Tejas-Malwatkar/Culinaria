import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchRecipes } from '../api/recipe.api';
import { getCategories } from '../api/public';
import RecipeCard from '../components/RecipeCard';
import type { Recipe, SearchQueryParams } from '../types/recipe';

interface Category {
  id: string;
  name: string;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialized from URL query params
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || '');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');
  const [dietary, setDietary] = useState(searchParams.get('dietary') || '');
  const [maxPrepTime, setMaxPrepTime] = useState<number | undefined>(
    searchParams.get('maxPrepTime') ? Number(searchParams.get('maxPrepTime')) : undefined,
  );
  const [sortBy, setSortBy] = useState<SearchQueryParams['sortBy']>(
    (searchParams.get('sortBy') as SearchQueryParams['sortBy']) || 'newest',
  );

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Categories on mount
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const performSearch = useCallback(async () => {
    try {
      setLoading(true);
      const params: SearchQueryParams = {
        q: query.trim() || undefined,
        categoryId: categoryId || undefined,
        cuisine: cuisine.trim() || undefined,
        difficulty: difficulty || undefined,
        dietary: dietary.trim() || undefined,
        maxPrepTime: maxPrepTime || undefined,
        sortBy,
      };

      const results = await searchRecipes(params);
      setRecipes(results);
    } catch (err) {
      console.error('Search failed:', err);
      setRecipes([]);
    } flex: {
      setLoading(false);
    }
  }, [query, categoryId, cuisine, difficulty, dietary, maxPrepTime, sortBy]);

  // Sync state to URL search params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (categoryId) params.categoryId = categoryId;
    if (cuisine) params.cuisine = cuisine;
    if (difficulty) params.difficulty = difficulty;
    if (dietary) params.dietary = dietary;
    if (maxPrepTime) params.maxPrepTime = String(maxPrepTime);
    if (sortBy) params.sortBy = sortBy;

    setSearchParams(params, { replace: true });
    performSearch();
  }, [query, categoryId, cuisine, difficulty, dietary, maxPrepTime, sortBy, setSearchParams, performSearch]);

  const clearAllFilters = () => {
    setQuery('');
    setCategoryId('');
    setCuisine('');
    setDifficulty('');
    setDietary('');
    setMaxPrepTime(undefined);
    setSortBy('newest');
  };

  const hasActiveFilters =
    query || categoryId || cuisine || difficulty || dietary || maxPrepTime;

  return (
    <div className="min-h-screen bg-amber-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-black text-slate-900">Explore & Search Recipes</h1>
          <p className="text-xs text-slate-500 mt-1">
            Filter by categories, cuisines, difficulty, cooking time, and dietary preference
          </p>
        </div>

        {/* SEARCH BAR & SORTING HEADER */}
        <div className="bg-white border border-amber-100 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by recipe title, ingredients, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SearchQueryParams['sortBy'])}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="newest">Latest Published</option>
              <option value="popular">Most Popular (Likes)</option>
              <option value="rating">Highest Rated</option>
              <option value="cookTime">Fastest to Cook</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* LAYOUT: SIDEBAR FILTERS + MAIN RESULTS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* FILTER PANEL */}
          <aside className="bg-white border border-amber-100 p-6 rounded-2xl shadow-xs space-y-6 h-fit">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-bold text-slate-900 text-sm">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cuisine Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Cuisine
              </label>
              <input
                type="text"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="e.g. Indian, Italian, Chinese"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none"
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Difficulty Level
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      difficulty === diff
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {diff === '' ? 'All' : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Preference */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Dietary Preference
              </label>
              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="e.g. Vegetarian, Gluten-Free"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none"
              />
            </div>

            {/* Max Prep Time Slider */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Max Prep Time: {maxPrepTime ? `${maxPrepTime} mins` : 'Any'}
              </label>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={maxPrepTime || 120}
                onChange={(e) => setMaxPrepTime(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>5m</span>
                <span>60m</span>
                <span>120m+</span>
              </div>
            </div>
          </aside>

          {/* MAIN RESULTS GRID */}
          <main className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Found <strong className="text-slate-900">{recipes.length}</strong> recipes
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : recipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((r) => (
                  <RecipeCard key={r.id} recipe={r} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-amber-100 rounded-2xl p-12 text-center space-y-4 shadow-xs">
                <div className="text-4xl">🔍</div>
                <h3 className="text-lg font-bold text-slate-900">No matching recipes found</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  Try adjusting your search keywords, clearing active filters, or expanding your prep time limit.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-amber-500 text-white font-bold text-xs rounded-xl hover:bg-amber-600 transition"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
