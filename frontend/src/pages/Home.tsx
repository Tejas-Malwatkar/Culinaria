import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPopularRecipes, getRecentRecipes } from '../api/recipe.api';
import { getCategories } from '../api/public';
import RecipeCard from '../components/RecipeCard';
import type { Recipe } from '../types/recipe';

interface Category {
  id: string;
  name: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [popular, setPopular] = useState<Recipe[]>([]);
  const [recent, setRecent] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pop, rec, cat] = await Promise.all([
          getPopularRecipes(),
          getRecentRecipes(),
          getCategories(),
        ]);

        setPopular(pop);
        setRecent(rec);
        setCategories(cat);
      } catch (error) {
        console.error('Failed to load home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const categoryIcons: Record<string, string> = {
    Breakfast: '🥞',
    'Main Course': '🍲',
    Dessert: '🍰',
    Beverages: '🍹',
    Snacks: '🍿',
    Appetizer: '🥗',
  };

  return (
    <div className="bg-amber-50/30 min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <span>✨ Complete Recipe Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Discover & Master Culinary Creations
          </h1>

          <p className="text-base sm:text-xl text-amber-100/90 max-w-2xl mx-auto font-normal">
            Explore thousands of artisanal recipes, step-by-step cooking instructions, ingredient checklists, and community reviews.
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto flex items-center bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl shadow-2xl focus-within:ring-2 focus-within:ring-amber-400 transition"
          >
            <div className="pl-3 pr-2 text-amber-300 text-lg">🔍</div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes, ingredients (e.g. Paneer, Pasta, Chocolate)..."
              className="w-full bg-transparent text-white placeholder-amber-200/70 px-2 py-2 text-sm sm:text-base outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition text-sm whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* Featured Metrics */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center border-t border-white/10 text-xs text-amber-200/80">
            <div>
              <span className="block text-xl font-black text-amber-400">100%</span>
              Structured Ingredients
            </div>
            <div>
              <span className="block text-xl font-black text-amber-400">Step-by-Step</span>
              Cooking Guides
            </div>
            <div>
              <span className="block text-xl font-black text-amber-400">Ratings & Reviews</span>
              Community Feedback
            </div>
            <div>
              <span className="block text-xl font-black text-amber-400">Role & Admin</span>
              Production Ready
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        {/* CATEGORIES BAR */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Browse by Category</h2>
              <p className="text-xs text-slate-500">Find recipes tailored to every meal of the day</p>
            </div>
            <Link
              to="/search"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/search?categoryId=${cat.id}`}
                className="bg-white border border-amber-100 p-4 rounded-2xl text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-amber-300 transition group flex flex-col items-center justify-center gap-2"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {categoryIcons[cat.name] || '🍲'}
                </span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* POPULAR RECIPES */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">🔥 Popular Recipes</h2>
              <p className="text-xs text-slate-500">Most saved and highly rated recipes by the community</p>
            </div>
            <Link
              to="/search?sortBy=popular"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              See All Popular →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : popular.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popular.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white border border-amber-100 rounded-2xl text-center text-slate-500 text-sm">
              No popular recipes yet.
            </div>
          )}
        </section>

        {/* RECENTLY ADDED */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">✨ Recently Added</h2>
              <p className="text-xs text-slate-500">Fresh recipes published recently by creators</p>
            </div>
            <Link
              to="/search?sortBy=newest"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Explore Latest →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : recent.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recent.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white border border-amber-100 rounded-2xl text-center text-slate-500 text-sm">
              No recipes available.
            </div>
          )}
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black">Got a Special Recipe to Share?</h3>
            <p className="text-amber-100 text-sm">
              Join Chef Maria and culinary enthusiasts! Share your recipes with complete ingredients, step-by-step instructions, and images.
            </p>
          </div>
          <Link
            to="/recipes/new"
            className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-sm rounded-xl shadow-lg hover:scale-105 transition whitespace-nowrap"
          >
            + Create New Recipe Now
          </Link>
        </section>
      </div>
    </div>
  );
}
