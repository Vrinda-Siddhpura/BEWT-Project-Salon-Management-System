import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('salon_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('salon_token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('salon_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Failed to verify token', error);
          localStorage.removeItem('salon_token');
          localStorage.removeItem('salon_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success && res.data) {
      localStorage.setItem('salon_token', res.data.token);
      localStorage.setItem('salon_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        role: user?.role || null,
        isAdmin: user?.role === 'Administrator',
        isReceptionist: user?.role === 'Receptionist',
        isBarber: user?.role === 'Barber',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
