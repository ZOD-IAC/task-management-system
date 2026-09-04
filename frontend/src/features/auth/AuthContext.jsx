import { createContext, useContext, useEffect, useState } from 'react';
import { registerUser, loginUser, logoutUser, fetchProfile } from './authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Starts true: the token lives in an httpOnly cookie, so the only way
  // to know if a session exists is to ask the server — there's nothing
  // to read client-side to short-circuit this check.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const register = async (payload) => {
    const res = await registerUser(payload);
    setUser(res.data.user);
    return res;
  };

  const login = async (payload) => {
    const res = await loginUser(payload);
    setUser(res.data.user);
    return res;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
