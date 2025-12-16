"use client";

import { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from '@/app/hooks/useAuth';
import type { User } from '@/app/hooks/useAuth';
import api from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const setUserId = useAppStore((state) => state.setUserId);

  const verifyToken = async (): Promise<boolean> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return false;
    }

    try {
      const response = await api.get('/auth/verify-token');

      if (response.data && response.data.success) {
        console.log('AuthProvider verifyToken success:', response.data.user);
        setUser(response.data.user);
        if (response.data.user?.id) {
            setUserId(response.data.user.id);
        }
        setLoading(false);
        return true;
      } else {
        console.warn('Token verification failed: success flag missing', response.data);
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const login = (token: string) => {
    localStorage.setItem('token', token);
    verifyToken();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifyToken }}>
      {children}
    </AuthContext.Provider>
  );
};
