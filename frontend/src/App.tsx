import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import CreateRecipe from './pages/recipes/CreateRecipe';
import EditRecipe from './pages/recipes/EditRecipe';
import Profile from './pages/Profile';
import LikedRecipes from './pages/LikedRecipes';
import AdminDashboard from './pages/AdminDashboard';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen bg-amber-50/20 text-slate-800 antialiased font-sans">
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* 🌍 Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/categories/:id" element={<CategoryPage />} />
            <Route path="/search" element={<SearchPage />} />

            <Route
              path="/recipes/new"
              element={
                <ProtectedRoute>
                  <CreateRecipe />
                </ProtectedRoute>
              }
            />

            <Route
              path="/recipes/:id/edit"
              element={
                <ProtectedRoute>
                  <EditRecipe />
                </ProtectedRoute>
              }
            />

            {/* 🔐 Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 🔒 Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/likes"
              element={
                <ProtectedRoute>
                  <LikedRecipes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
                  <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-3xl font-black mb-4">
                    404
                  </div>
                  <h1 className="mb-2 text-3xl font-black text-slate-900">
                    Page Not Found
                  </h1>
                  <p className="max-w-md mb-6 text-xs text-slate-500">
                    The requested page could not be located.
                  </p>
                  <Link
                    to="/"
                    className="px-6 py-2.5 text-xs font-bold text-white bg-amber-600 rounded-xl shadow-xs hover:bg-amber-700 transition"
                  >
                    Return to Homepage
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
