'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const router = useRouter();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [mounted, setMounted] = useState(false); console.log("AuthModal render", {isAuthModalOpen, mounted});
  useEffect(() => setMounted(true), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'login') {
      login(email, name || 'User', password);
      // Redirect admin to admin panel
      if (email === 'admin' && password === 'admin') {
        setAuthModalOpen(false);
        router.push('/admin');
        return;
      }
    } else {
      register(email, name || 'New User');
    }
    setAuthModalOpen(false);
  };

  if (!mounted) return null;

  return (
    <>
      {isAuthModalOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setAuthModalOpen(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="w-full max-w-md bg-surface border border-gray-800 rounded-[28px] shadow-2xl overflow-hidden pointer-events-auto flex flex-col animate-in fade-in zoom-in-95 duration-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
                <div className="flex items-center space-x-2">
                  <img src="/logo.png" alt="CheckIt Logo" className="w-6 h-6 rounded-md aspect-square object-cover" />
                  <span className="font-semibold text-lg text-white">CheckIt</span>
                </div>
                <button 
                  onClick={() => setAuthModalOpen(false)}
                  className="p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Tabs */}
                <div className="flex bg-black/30 p-1 rounded-2xl mb-8 border border-gray-800/50">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                      activeTab === 'login' 
                        ? 'bg-surface shadow-sm text-white border border-gray-700' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Увійти
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                      activeTab === 'register' 
                        ? 'bg-surface shadow-sm text-white border border-gray-700' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Реєстрація
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {activeTab === 'register' && (
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input 
                        type="text" 
                        placeholder="Ваше ім'я" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required 
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                      type="text" 
                      placeholder="Email або логін" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required 
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                      type="password" 
                      placeholder="Пароль" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required 
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 bg-brand text-white hover:bg-brand/90 !rounded-2xl mt-4 font-medium shadow-lg shadow-brand/20">
                    {activeTab === 'login' ? 'Увійти в систему' : 'Створити акаунт'}
                  </Button>
                </form>

                {/* Footer text */}
                <p className="text-center text-xs text-gray-500 mt-6">
                  Продовжуючи, ви погоджуєтеся з нашими <br/>
                  <a href="#" className="text-brand hover:underline">Умовами використання</a> та <a href="#" className="text-brand hover:underline">Політикою конфіденційності</a>.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
