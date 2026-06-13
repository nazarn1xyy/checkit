'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, Activity, BarChart3,
  Settings, LogOut, Shield
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Користувачі', icon: Users },
  { href: '/admin/requests', label: 'Запити', icon: Activity },
  { href: '/admin/analytics', label: 'Аналітика', icon: BarChart3 },
  { href: '/admin/settings', label: 'Налаштування', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';
  const needsRedirect = !isLoginPage && (!user || !isAdmin);

  useEffect(() => {
    if (needsRedirect) {
      router.replace('/admin/login');
    }
  }, [needsRedirect, router]);

  // Allow login page without auth
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show redirect placeholder while navigating
  if (needsRedirect) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-500 text-sm">Перенаправлення...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-gray-800 flex flex-col fixed h-full z-30">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-brand" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">CheckIt Admin</div>
              <div className="text-[10px] text-gray-500">Панель управління</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-brand/10 text-brand font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => { logout(); router.push('/admin/login'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Вийти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
