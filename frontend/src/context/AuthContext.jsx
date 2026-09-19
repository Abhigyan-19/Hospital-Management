import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const DEMO_USER = { name: 'Aarav Mehta', role: 'ADMIN', email: 'admin@sebasethu.health' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sebasethu-user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('sebasethu-user', JSON.stringify(user));
    else localStorage.removeItem('sebasethu-user');
  }, [user]);

  const login = async ({ email }) => {
    const loggedInUser = { ...DEMO_USER, email: email || DEMO_USER.email };
    setUser(loggedInUser);
    localStorage.setItem('sebasethu-token', 'demo-jwt-token');
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sebasethu-token');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
