import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
      isActive
        ? 'bg-amber-500 text-white shadow-sm'
        : 'text-slate-700 hover:text-slate-900 hover:bg-amber-50/80'
    }`;

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-amber-100 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-xl shadow-sm shadow-amber-200 group-hover:scale-105 transition-transform">
              🍳
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-none group-hover:text-amber-600 transition">
                Culinaria
              </span>
              <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase">
                Recipe System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/" end className={navLinkStyle}>
              Home
            </NavLink>

            <NavLink to="/search" className={navLinkStyle}>
              Explore & Search
            </NavLink>

            {user && (
              <>
                <NavLink to="/likes" className={navLinkStyle}>
                  Saved Favorites
                </NavLink>

                <NavLink to="/dashboard" className={navLinkStyle}>
                  My Dashboard
                </NavLink>

                {user.role === 'ADMIN' && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        isActive
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`
                    }
                  >
                    🛡️ Admin Panel
                  </NavLink>
                )}
              </>
            )}
          </nav>

          {/* User Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/recipes/new"
                  className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs hover:shadow-amber-200 transition flex items-center gap-1.5"
                >
                  <span>+</span>
                  <span>Create Recipe</span>
                </Link>

                <div className="h-6 w-px bg-slate-200 mx-1" />

                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-amber-600 transition"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-amber-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs border border-amber-200">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[120px] truncate">{user.name}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl text-sm font-medium ${
                isActive ? 'bg-amber-500 text-white' : 'text-slate-700'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl text-sm font-medium ${
                isActive ? 'bg-amber-500 text-white' : 'text-slate-700'
              }`
            }
          >
            Search & Filters
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/recipes/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 text-white"
              >
                + Create Recipe
              </NavLink>
              <NavLink
                to="/likes"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-amber-500 text-white' : 'text-slate-700'
                  }`
                }
              >
                Saved Favorites
              </NavLink>
              <NavLink
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-amber-500 text-white' : 'text-slate-700'
                  }`
                }
              >
                My Dashboard
              </NavLink>
              <NavLink
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-amber-500 text-white' : 'text-slate-700'
                  }`
                }
              >
                Profile ({user.name})
              </NavLink>
              {user.role === 'ADMIN' && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-bold bg-purple-100 text-purple-800"
                >
                  🛡️ Admin Panel
                </NavLink>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
