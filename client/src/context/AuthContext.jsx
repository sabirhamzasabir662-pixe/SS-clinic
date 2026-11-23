import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('ss_token') || sessionStorage.getItem('ss_token') || null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ss_user') || sessionStorage.getItem('ss_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const data = await api.getProfile(token);
          setUser(data.user);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (username, password, remember = true) => {
    const data = await api.login(username, password);
    setToken(data.token);
    setUser(data.user);

    if (remember) {
      localStorage.setItem('ss_token', data.token);
      localStorage.setItem('ss_user', JSON.stringify(data.user));
      sessionStorage.removeItem('ss_token');
      sessionStorage.removeItem('ss_user');
    } else {
      sessionStorage.setItem('ss_token', data.token);
      sessionStorage.setItem('ss_user', JSON.stringify(data.user));
      localStorage.removeItem('ss_token');
      localStorage.removeItem('ss_user');
    }

    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    sessionStorage.removeItem('ss_token');
    sessionStorage.removeItem('ss_user');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
