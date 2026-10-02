import { useEffect, useState, useCallback } from 'react';
import {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  deleteAdminUser,
  getAdminRecipes,
  createCategory,
  deleteCategory,
} from '../api/admin.api';
import type { AdminStats } from '../api/admin.api';

import { getCategories } from '../api/public';
import { deleteRecipe } from '../api/recipe.api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import type { User } from '../types/user';
import type { Recipe } from '../types/recipe';

interface Category {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'recipes' | 'categories'>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category input
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, usersData, recipesData, categoriesData] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminRecipes(),
        getCategories(),
      ]);

      setStats(statsData);
      setUsers(usersData);
      setRecipes(recipesData);
      setCategories(categoriesData);
    } catch {
      addToast('Failed to load admin data', 'error');
    } flex: {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadData();
    }
  }, [user, loadData]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-amber-50/30 text-center">
        <div className="bg-white border border-amber-100 p-8 rounded-3xl max-w-md shadow-md">
          <div className="text-4xl mb-3">🛡️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
          <p className="text-xs text-slate-500 mb-4">
            You must be logged in as an Administrator to access the system dashboard.
          </p>
        </div>
      </div>
    );
  }

  const handleRoleToggle = async (targetUser: User) => {
    const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await updateUserRole(targetUser.id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u)),
      );
      addToast(`Role updated to ${newRole} for ${targetUser.name}`, 'success');
    } catch {
      addToast('Failed to update user role', 'error');
    }
  };

  const handleUserDelete = (targetUser: User) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user "${targetUser.name}" (${targetUser.email}) and all their recipes & reviews?`,
      onConfirm: async () => {
        try {
          await deleteAdminUser(targetUser.id);
          setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
          addToast('User deleted successfully', 'success');
        } catch {
          addToast('Failed to delete user', 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleRecipeDelete = (targetRecipe: Recipe) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Recipe',
      message: `Are you sure you want to delete recipe "${targetRecipe.title}" by ${targetRecipe.author?.name || 'User'}?`,
      onConfirm: async () => {
        try {
          await deleteRecipe(targetRecipe.id);
          setRecipes((prev) => prev.filter((r) => r.id !== targetRecipe.id));
          addToast('Recipe deleted successfully', 'success');
        } catch {
          addToast('Failed to delete recipe', 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleCategoryCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setAddingCat(true);
      const created = await createCategory(newCatName.trim());
      setCategories((prev) => [...prev, created]);
      setNewCatName('');
      addToast(`Category "${created.name}" created`, 'success');
    } catch {
      addToast('Failed to create category', 'error');
    } finally {
      setAddingCat(false);
    }
  };

  const handleCategoryDelete = (cat: Category) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${cat.name}"?`,
      onConfirm: async () => {
        try {
          await deleteCategory(cat.id);
          setCategories((prev) => prev.filter((c) => c.id !== cat.id));
          addToast('Category deleted', 'info');
        } catch {
          addToast('Failed to delete category. Ensure no recipes are attached.', 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-amber-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-purple-100 p-6 rounded-3xl shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-black rounded-full uppercase">
                Admin Control Panel
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mt-2">System Dashboard</h1>
            <p className="text-xs text-slate-500">
              Manage platform users, recipes, categories, and system telemetry
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'stats', label: '📊 Telemetry' },
              { id: 'users', label: '👥 Users' },
              { id: 'recipes', label: '🍲 Recipes' },
              { id: 'categories', label: '🏷️ Categories' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* METRIC COUNTER CARDS */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white border border-purple-100 p-5 rounded-2xl shadow-xs text-center">
              <span className="block text-2xl font-black text-purple-700">{stats.totalUsers}</span>
              <span className="text-xs font-bold text-slate-500">Registered Users</span>
            </div>
            <div className="bg-white border border-amber-100 p-5 rounded-2xl shadow-xs text-center">
              <span className="block text-2xl font-black text-amber-600">{stats.totalRecipes}</span>
              <span className="text-xs font-bold text-slate-500">Total Recipes</span>
            </div>
            <div className="bg-white border border-emerald-100 p-5 rounded-2xl shadow-xs text-center">
              <span className="block text-2xl font-black text-emerald-600">{stats.totalCategories}</span>
              <span className="text-xs font-bold text-slate-500">Active Categories</span>
            </div>
            <div className="bg-white border border-blue-100 p-5 rounded-2xl shadow-xs text-center">
              <span className="block text-2xl font-black text-blue-600">{stats.totalReviews}</span>
              <span className="text-xs font-bold text-slate-500">Reviews Posted</span>
            </div>
            <div className="bg-white border border-rose-100 p-5 rounded-2xl shadow-xs text-center">
              <span className="block text-2xl font-black text-rose-600">{stats.totalLikes}</span>
              <span className="text-xs font-bold text-slate-500">Saved Favorites</span>
            </div>
          </div>
        )}

        {/* TAB 1: TELEMETRY & STATS */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Users */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Recent User Signups</h3>
              <div className="space-y-3">
                {stats.recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-slate-500">{u.email}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Recipes */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Recent Recipe Creations</h3>
              <div className="space-y-3">
                {stats.recentRecipes.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{r.title}</span>
                      <span className="text-slate-500">By {r.author?.name || 'Chef'} • {r.category?.name}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="font-bold text-slate-900 text-base">User Management</h3>
              <p className="text-xs text-slate-500">Toggle roles between USER and ADMIN or remove accounts</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-900 font-bold uppercase tracking-wider text-[11px] border-b">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Created Recipes</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                          {u.name.charAt(0)}
                        </div>
                        {u.name}
                      </td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-semibold">{u._count?.recipes ?? 0} Recipes</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleRoleToggle(u)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition"
                        >
                          Make {u.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                        </button>
                        {user.id !== u.id && (
                          <button
                            onClick={() => handleUserDelete(u)}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: RECIPES MANAGEMENT */}
        {activeTab === 'recipes' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="font-bold text-slate-900 text-base">Recipe Management</h3>
              <p className="text-xs text-slate-500">Monitor all system recipes and remove inappropriate content</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-900 font-bold uppercase tracking-wider text-[11px] border-b">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Likes & Reviews</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recipes.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-slate-900">{r.title}</td>
                      <td className="p-4 font-semibold text-amber-700">{r.category?.name || 'N/A'}</td>
                      <td className="p-4 text-slate-600">{r.author?.name || 'Unknown'}</td>
                      <td className="p-4 font-semibold">
                        ❤️ {r._count?.likes || 0} • 💬 {r._count?.reviews || 0}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleRecipeDelete(r)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition"
                        >
                          Delete Recipe
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORY MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Add New Category</h3>
              <form onSubmit={handleCategoryCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Seafood, Soups, Vegan"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingCat}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  {addingCat ? 'Creating...' : '+ Create Category'}
                </button>
              </form>
            </div>

            <div className="md:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Existing Categories ({categories.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs font-bold text-slate-800">
                    <span>{c.name}</span>
                    <button
                      onClick={() => handleCategoryDelete(c)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        isDangerous
      />
    </div>
  );
}
