'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: authLogin } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === 'admin' && password === 'admin') {
      authLogin(login, 'Administrator', password);
      router.push('/admin');
    } else {
      setError('Невірний логін або пароль');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-surface border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-brand" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white text-center mb-1">Адмін-панель</h1>
          <p className="text-gray-500 text-sm text-center mb-6">Увійдіть для доступу до панелі управління</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Логін</label>
              <input
                type="text"
                value={login}
                onChange={e => setLogin(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/30 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand transition-colors"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/30 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand transition-colors"
                placeholder="••••••"
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-brand text-white text-sm font-medium rounded-xl hover:bg-brand/90 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Увійти
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
