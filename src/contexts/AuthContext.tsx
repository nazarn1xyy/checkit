'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, hasSupabase } from '../lib/supabase';

type User = {
  name: string;
  email: string;
  avatar?: string;
  role?: 'user' | 'admin';
};

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, name: string, password?: string) => void;
  register: (email: string, name: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('checkit_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (hasSupabase && supabase) {
          supabase.from('users').select('*').eq('email', parsedUser.email).single()
            .then(({ data, error }) => {
              if (data) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUser({
                  name: data.name,
                  email: data.email,
                  avatar: data.avatar_url,
                  role: data.role
                });
              } else {
                // Ensure they exist in Supabase if they are loaded from local storage
                supabase!.from('users').upsert({
                  email: parsedUser.email,
                  name: parsedUser.name,
                  role: parsedUser.role,
                  avatar_url: parsedUser.avatar,
                  last_login: new Date().toISOString()
                }).then(() => {});
                
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUser(parsedUser);
              }
              setIsLoaded(true);
            });
          return;
        } else {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setUser(parsedUser);
        }
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const login = (email: string, name: string, password?: string) => {
    // Special admin credentials check
    const isAdminLogin = email === 'admin' && password === 'admin';
    const role: 'user' | 'admin' = isAdminLogin ? 'admin' : 'user';
    const newUser: User = {
      name: isAdminLogin ? 'Administrator' : name,
      email: isAdminLogin ? 'admin' : email,
      avatar: isAdminLogin ? undefined : `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`,
      role,
    };
    setUser(newUser);
    localStorage.setItem('checkit_user', JSON.stringify(newUser));

    if (hasSupabase && supabase) {
      supabase.from('users').upsert({
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatar_url: newUser.avatar,
        last_login: new Date().toISOString()
      }).then(({ error }) => {
        if (error) console.error('Supabase user save error:', error.message, error.details, error.hint, error);
      });
    }

    // Track user on server (fire-and-forget)
    fetch('/api/admin/track-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newUser.email, name: newUser.name, role }),
    }).catch(() => {});
  };

  const register = (email: string, name: string) => {
    // For MVP, register just logs them in directly
    login(email, name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('checkit_user');
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'burmalda@gmail.com';

  if (!isLoaded) {
    // Show a minimal shell instead of null to prevent black screen
    return (
      <AuthContext.Provider value={{ user: null, isAdmin: false, login: () => {}, register: () => {}, logout: () => {}, isAuthModalOpen: false, setAuthModalOpen: () => {} }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout, isAuthModalOpen, setAuthModalOpen }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
