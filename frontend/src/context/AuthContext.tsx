import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getMe, logout } from '../api/auth';
import type { User } from '../types/user';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  logoutUser: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getMe();

        if (!currentUser) {
          localStorage.removeItem('token');
        }

        setUser(currentUser);
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, setUser, logoutUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)!;
